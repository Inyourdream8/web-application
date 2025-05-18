import fs from 'fs';
import path from 'path';
import { Reporter } from 'jest';

interface TestResult {
  name: string;
  duration: number;
  status: 'passed' | 'failed';
  error?: string;
  performanceMetrics?: {
    loadTime?: number;
    memoryUsage?: number;
    apiResponseTime?: number;
  };
}

interface TestReport {
  timestamp: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  performance: {
    averageLoadTime: number;
    averageMemoryUsage: number;
    averageApiResponseTime: number;
  };
  results: TestResult[];
}

class TestReporter implements Reporter {
  private results: TestResult[] = [];
  private startTime: number = Date.now();
  private outputDir: string = 'test-reports';

  constructor(globalConfig: any, options: any) {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  onRunStart(): void {
    this.startTime = Date.now();
    console.log('\nStarting test suite execution...');
  }

  onTestStart(test: any): void {
    console.log(`\nRunning test: ${test.title}`);
  }

  onTestResult(test: any, testResult: any): void {
    testResult.testResults.forEach((result: any) => {
      this.results.push({
        name: result.title,
        duration: result.duration,
        status: result.status === 'passed' ? 'passed' : 'failed',
        error: result.failureMessages?.join('\n'),
        performanceMetrics: result.performanceMetrics
      });
    });
  }

  onRunComplete(): void {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;

    const report: TestReport = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed,
        failed,
        skipped: 0,
        duration
      },
      performance: {
        averageLoadTime: this.calculateAverageMetric('loadTime'),
        averageMemoryUsage: this.calculateAverageMetric('memoryUsage'),
        averageApiResponseTime: this.calculateAverageMetric('apiResponseTime')
      },
      results: this.results
    };

    this.saveReport(report);
    this.generateHtmlReport(report);
    this.generateMarkdownReport(report);
    this.logSummary(report);
  }

  private calculateAverageMetric(metricName: keyof TestResult['performanceMetrics']): number {
    const metrics = this.results
      .map(r => r.performanceMetrics?.[metricName])
      .filter((m): m is number => m !== undefined);
    
    return metrics.length > 0
      ? metrics.reduce((a, b) => a + b, 0) / metrics.length
      : 0;
  }

  private saveReport(report: TestReport): void {
    const filename = `test-report-${report.timestamp.split('T')[0]}.json`;
    fs.writeFileSync(
      path.join(this.outputDir, filename),
      JSON.stringify(report, null, 2)
    );
  }

  private generateHtmlReport(report: TestReport): void {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Report - ${report.timestamp}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .metric { padding: 15px; border-radius: 8px; margin: 10px 0; }
            .passed { background-color: #e6ffe6; }
            .failed { background-color: #ffe6e6; }
            .performance { background-color: #e6f3ff; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
            th { background-color: #f5f5f5; }
            .chart-container { margin: 20px 0; height: 300px; }
            @media (prefers-color-scheme: dark) {
              body { background-color: #1a1a1a; color: #fff; }
              th { background-color: #2d2d2d; }
              td, th { border-color: #404040; }
              .metric { border: 1px solid #404040; }
            }
          </style>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        </head>
        <body>
          <h1>Test Report</h1>
          <div class="summary">
            <div class="metric">
              <h2>Test Summary</h2>
              <p>Total Tests: ${report.summary.total}</p>
              <p>Passed: ${report.summary.passed}</p>
              <p>Failed: ${report.summary.failed}</p>
              <p>Duration: ${report.summary.duration}ms</p>
            </div>
            <div class="metric performance">
              <h2>Performance Metrics</h2>
              <p>Average Load Time: ${report.performance.averageLoadTime.toFixed(2)}ms</p>
              <p>Average Memory Usage: ${(report.performance.averageMemoryUsage / 1024 / 1024).toFixed(2)}MB</p>
              <p>Average API Response: ${report.performance.averageApiResponseTime.toFixed(2)}ms</p>
            </div>
          </div>
          
          <div class="chart-container">
            <canvas id="performanceChart"></canvas>
          </div>

          <table>
            <thead>
              <tr>
                <th>Test</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              ${report.results.map(result => `
                <tr class="${result.status}">
                  <td>${result.name}</td>
                  <td>${result.status}</td>
                  <td>${result.duration}ms</td>
                  <td>${result.error || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <script>
            const ctx = document.getElementById('performanceChart');
            new Chart(ctx, {
              type: 'bar',
              data: {
                labels: ['Load Time', 'Memory Usage (MB)', 'API Response Time'],
                datasets: [{
                  label: 'Performance Metrics',
                  data: [
                    ${report.performance.averageLoadTime},
                    ${report.performance.averageMemoryUsage / 1024 / 1024},
                    ${report.performance.averageApiResponseTime}
                  ],
                  backgroundColor: ['rgba(54, 162, 235, 0.5)']
                }]
              },
              options: {
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: 'Performance Metrics Overview'
                  }
                }
              }
            });
          </script>
        </body>
      </html>
    `;

    fs.writeFileSync(
      path.join(this.outputDir, `test-report-${report.timestamp.split('T')[0]}.html`),
      html
    );
  }

  private generateMarkdownReport(report: TestReport): void {
    const markdown = `
# Test Report - ${report.timestamp}

## Summary
- **Total Tests:** ${report.summary.total}
- **Passed:** ${report.summary.passed}
- **Failed:** ${report.summary.failed}
- **Duration:** ${report.summary.duration}ms

## Performance Metrics
- **Average Load Time:** ${report.performance.averageLoadTime.toFixed(2)}ms
- **Average Memory Usage:** ${(report.performance.averageMemoryUsage / 1024 / 1024).toFixed(2)}MB
- **Average API Response:** ${report.performance.averageApiResponseTime.toFixed(2)}ms

## Test Results

| Test | Status | Duration | Error |
|------|--------|----------|--------|
${report.results.map(result => `| ${result.name} | ${result.status} | ${result.duration}ms | ${result.error || ''} |`).join('\n')}

${report.summary.failed > 0 ? `
## Failed Tests Details

${report.results
  .filter(r => r.status === 'failed')
  .map(result => `
### ${result.name}
- **Duration:** ${result.duration}ms
- **Error:** ${result.error}
  `).join('\n')}
` : ''}
`;

    fs.writeFileSync(
      path.join(this.outputDir, `test-report-${report.timestamp.split('T')[0]}.md`),
      markdown.trim()
    );
  }

  private logSummary(report: TestReport): void {
    console.log('\nTest Suite Summary:');
    console.log('------------------');
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Duration: ${report.summary.duration}ms`);
    console.log('\nPerformance Metrics:');
    console.log('-------------------');
    console.log(`Average Load Time: ${report.performance.averageLoadTime.toFixed(2)}ms`);
    console.log(`Average Memory Usage: ${(report.performance.averageMemoryUsage / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Average API Response: ${report.performance.averageApiResponseTime.toFixed(2)}ms`);
    
    if (report.summary.failed > 0) {
      console.log('\nFailed Tests:');
      console.log('-------------');
      report.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(`\n${result.name}`);
          console.log(`Error: ${result.error}`);
        });
    }
  }
}

export default TestReporter;