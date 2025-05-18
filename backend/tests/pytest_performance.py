import pytest
import json
import time
import os
from datetime import datetime

class PerformancePlugin:
    def __init__(self):
        self.performance_data = {
            'timestamp': datetime.now().isoformat(),
            'tests': [],
            'summary': {
                'total_duration': 0,
                'total_memory': 0,
                'test_count': 0,
                'slow_tests': 0
            }
        }

    @pytest.hookimpl(hookwrapper=True)
    def pytest_runtest_protocol(self, item):
        if "performance" in item.keywords or "load_test" in item.keywords:
            start_time = time.time()
            start_memory = self._get_memory_usage()
            
            yield
            
            end_time = time.time()
            end_memory = self._get_memory_usage()
            
            duration = (end_time - start_time) * 1000
            memory_used = end_memory - start_memory
            
            self._record_test_metrics(item.name, duration, memory_used)
        else:
            yield

    def _get_memory_usage(self):
        import psutil
        process = psutil.Process(os.getpid())
        return process.memory_info().rss / 1024 / 1024  # Convert to MB

    def _record_test_metrics(self, test_name, duration, memory_used):
        self.performance_data['tests'].append({
            'name': test_name,
            'duration_ms': duration,
            'memory_mb': memory_used,
            'is_slow': duration > 500  # Mark tests taking longer than 500ms
        })
        
        self.performance_data['summary']['total_duration'] += duration
        self.performance_data['summary']['total_memory'] += memory_used
        self.performance_data['summary']['test_count'] += 1
        if duration > 500:
            self.performance_data['summary']['slow_tests'] += 1

    def pytest_sessionfinish(self):
        if not os.path.exists('../test-reports'):
            os.makedirs('../test-reports')

        # Calculate averages
        test_count = self.performance_data['summary']['test_count']
        if test_count > 0:
            self.performance_data['summary']['avg_duration'] = (
                self.performance_data['summary']['total_duration'] / test_count
            )
            self.performance_data['summary']['avg_memory'] = (
                self.performance_data['summary']['total_memory'] / test_count
            )

        # Generate performance report
        report_path = os.path.join(
            '../test-reports', 
            f'backend-performance-{datetime.now().strftime("%Y%m%d-%H%M%S")}.json'
        )
        
        with open(report_path, 'w') as f:
            json.dump(self.performance_data, f, indent=2)

        # Print summary to console
        self._print_summary()

    def _print_summary(self):
        summary = self.performance_data['summary']
        print("\nBackend Performance Test Summary")
        print("===============================")
        print(f"Total Tests: {summary['test_count']}")
        print(f"Average Duration: {summary.get('avg_duration', 0):.2f}ms")
        print(f"Average Memory Usage: {summary.get('avg_memory', 0):.2f}MB")
        print(f"Slow Tests: {summary['slow_tests']}")
        
        if summary['slow_tests'] > 0:
            print("\nSlow Tests (>500ms):")
            for test in self.performance_data['tests']:
                if test['is_slow']:
                    print(f"- {test['name']}: {test['duration_ms']:.2f}ms")

def pytest_configure(config):
    config.pluginmanager.register(PerformancePlugin())