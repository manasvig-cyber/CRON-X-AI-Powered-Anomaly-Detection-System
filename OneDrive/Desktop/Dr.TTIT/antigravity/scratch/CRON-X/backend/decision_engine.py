"""
Decision Engine - Automated Response System
Receives AI predictions from MCP and triggers appropriate actions
"""

import asyncio
from typing import Dict, List, Set
from datetime import datetime, timedelta
import httpx

class DecisionEngine:
    def __init__(self, mcp_url: str = "http://localhost:8001"):
        """Initialize Decision Engine"""
        self.mcp_url = mcp_url
        self.blocked_ips: Set[str] = set()
        self.block_duration = {}  # IP -> unblock_time
        self.alert_callbacks = []
        
    async def analyze_log(self, log_data: Dict) -> Dict:
        """
        Send log to MCP AI model for analysis
        Returns prediction and recommended action
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.mcp_url}/mcp/infer",
                    json=log_data,
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    print(f"MCP Error: {response.status_code}")
                    return self._fallback_analysis(log_data)
                    
        except Exception as e:
            print(f"MCP Connection Error: {e}")
            return self._fallback_analysis(log_data)
    
    def _fallback_analysis(self, log_data: Dict) -> Dict:
        """Fallback rule-based analysis if MCP unavailable"""
        hour = datetime.fromtimestamp(log_data.get('timestamp', 0)).hour
        
        is_suspicious = False
        confidence = 0.0
        reason = "Normal activity"
        
        # Simple rule-based checks
        if 2 <= hour <= 5:
            is_suspicious = True
            confidence = 0.7
            reason = "Login at unusual hour"
        
        return {
            "is_anomaly": is_suspicious,
            "confidence": confidence,
            "reason": reason,
            "severity": "high" if confidence > 0.6 else "low",
            "recommended_action": "block_ip" if is_suspicious else "none"
        }
    
    async def execute_action(self, prediction: Dict, log_data: Dict) -> Dict:
        """
        Execute automated action based on AI prediction
        
        Actions:
        - block_ip: Block the suspicious IP address
        - alert: Create alert but don't block
        - monitor: Just log for monitoring
        """
        action = prediction.get("recommended_action", "none")
        ip = log_data.get("ip")
        alert_data = None
        
        if action == "block_ip" and ip:
            # Block the IP
            await self.block_ip(ip, duration_minutes=30)
            
            # Create high-severity alert
            alert_data = {
                "severity": "high",
                "user_id": log_data.get("user_id"),
                "ip": ip,
                "reason": prediction.get("reason"),
                "action_taken": f"IP {ip} blocked for 30 minutes",
                "confidence": prediction.get("confidence"),
                "timestamp": log_data.get("timestamp")
            }
            
        elif action == "alert":
            # Create alert without blocking
            alert_data = {
                "severity": prediction.get("severity", "medium"),
                "user_id": log_data.get("user_id"),
                "ip": ip,
                "reason": prediction.get("reason"),
                "action_taken": "Alert created - manual review required",
                "confidence": prediction.get("confidence"),
                "timestamp": log_data.get("timestamp")
            }
        
        # Trigger alert callbacks (send to dashboard)
        if alert_data:
            for callback in self.alert_callbacks:
                try:
                    await callback(alert_data)
                except Exception as e:
                    print(f"Alert callback error: {e}")
        
        return {
            "action_executed": action,
            "ip_blocked": ip in self.blocked_ips if ip else False,
            "alert_created": alert_data is not None,
            "alert_data": alert_data
        }
    
    async def block_ip(self, ip: str, duration_minutes: int = 30):
        """
        Block an IP address for specified duration
        In production, this would integrate with firewall/iptables
        """
        self.blocked_ips.add(ip)
        unblock_time = datetime.now() + timedelta(minutes=duration_minutes)
        self.block_duration[ip] = unblock_time
        
        print(f"🚫 BLOCKED IP: {ip} until {unblock_time.strftime('%H:%M:%S')}")
        
        # Schedule automatic unblock
        asyncio.create_task(self._auto_unblock(ip, duration_minutes * 60))
    
    async def _auto_unblock(self, ip: str, seconds: int):
        """Automatically unblock IP after duration"""
        await asyncio.sleep(seconds)
        if ip in self.blocked_ips:
            self.blocked_ips.remove(ip)
            if ip in self.block_duration:
                del self.block_duration[ip]
            print(f"✅ UNBLOCKED IP: {ip}")
    
    def is_ip_blocked(self, ip: str) -> bool:
        """Check if an IP is currently blocked"""
        return ip in self.blocked_ips
    
    def register_alert_callback(self, callback):
        """Register a callback function to be called when alerts are created"""
        self.alert_callbacks.append(callback)
    
    async def get_blocked_ips(self) -> List[Dict]:
        """Get list of currently blocked IPs"""
        blocked_list = []
        for ip in self.blocked_ips:
            unblock_time = self.block_duration.get(ip)
            blocked_list.append({
                "ip": ip,
                "unblock_time": unblock_time.isoformat() if unblock_time else None,
                "remaining_minutes": int((unblock_time - datetime.now()).total_seconds() / 60) if unblock_time else 0
            })
        return blocked_list

# Global instance
decision_engine = DecisionEngine()
