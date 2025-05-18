"""
Debug Controller for managing application-wide debugging features
"""
import psutil
import time
from typing import Dict, Any
from datetime import datetime
from flask import current_app
import tracemalloc

class DebugController:
    def __init__(self):
        self.debug_session_active = False
        self.start_time = None
        self.metrics = {}
        tracemalloc.start()
    
    def start_debug_session(self) -> Dict[str, Any]:
        """Start a new debugging session"""
        self.debug_session_active = True
        self.start_time = datetime.now()
        return {"status": "started", "timestamp": self.start_time}
    
    def stop_debug_session(self) -> Dict[str, Any]:
        """Stop the current debugging session"""
        self.debug_session_active = False
        duration = datetime.now() - self.start_time if self.start_time else None
        return {
            "status": "stopped",
            "duration": str(duration) if duration else None
        }
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """Collect system metrics"""
        process = psutil.Process()
        memory = process.memory_info()
        
        return {
            "cpu_percent": process.cpu_percent(),
            "memory_usage": {
                "rss": memory.rss / 1024 / 1024,  # MB
                "vms": memory.vms / 1024 / 1024   # MB
            },
            "threads": process.num_threads(),
            "open_files": len(process.open_files()),
            "connections": len(process.connections())
        }
    
    def take_memory_snapshot(self) -> Dict[str, Any]:
        """Take a snapshot of current memory usage"""
        snapshot = tracemalloc.take_snapshot()
        top_stats = snapshot.statistics('lineno')
        
        return {
            "top_memory_usage": [
                {
                    "file": stat.traceback[0].filename,
                    "line": stat.traceback[0].lineno,
                    "size": stat.size / 1024  # KB
                }
                for stat in top_stats[:10]
            ]
        }

debug_controller = DebugController()