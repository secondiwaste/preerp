# PreERP Performance Testing with Apache JMeter

This directory contains JMeter performance testing scripts for the PreERP application.

## Overview

The test simulates 200 concurrent users performing various operations:
- Login authentication
- Fetching projects list
- Retrieving project details
- Getting elemcsoport (element groups)
- Fetching items
- Accessing user lists

## Prerequisites

1. **Apache JMeter** (version 5.6 or higher)
   - Download from: https://jmeter.apache.org/download_jmeter.cgi
   - Extract and add `bin` directory to your PATH

2. **PreERP Application Running**
   - Backend server must be running on `http://localhost:3000`
   - Database must be populated with test data

3. **Test Users Created**
   - 20 test users must exist in the database
   - See setup instructions below

## Setup

### 1. Create Test Users in Database

Run the SQL script to create test users:

```bash
mysql -u root -p preerp < create-test-users.sql
```

Or manually execute the SQL script in your database client.

**Test User Credentials:**
- Usernames: `testuser1` through `testuser20`
- Password: `TestPass123!`

### 2. Ensure Test Data Exists

Make sure your database has:
- At least one project
- At least one elemcsoport (element group) in that project
- Some items in the elemcsoport

### 3. Configure Test Parameters (Optional)

Edit `performance-test.jmx` if you need to change:
- **Number of threads (users)**: Default is 200
- **Ramp-up time**: Default is 30 seconds (time to start all threads)
- **Loop count**: Default is 5 (each user repeats the test 5 times)
- **Server host/port**: Default is localhost:3000

You can also modify these in JMeter GUI:
- Open `performance-test.jmx` in JMeter
- Navigate to "User Thread Group" in the left panel
- Adjust parameters as needed

## Running the Tests

### Option 1: GUI Mode (Recommended for Test Development)

```bash
jmeter -t performance-test.jmx
```

Or simply double-click `performance-test.jmx` if JMeter is associated with .jmx files.

In GUI mode:
1. Click the green "Start" button (play icon) to run the test
2. View results in real-time using the listeners:
   - **View Results Tree**: See individual requests/responses
   - **Summary Report**: Quick overview of statistics
   - **Aggregate Report**: Detailed metrics including percentiles
   - **Graph Results**: Visual representation of response times

### Option 2: Command Line Mode (Recommended for Actual Performance Testing)

```bash
jmeter -n -t performance-test.jmx -l results.jtl -e -o report
```

Parameters:
- `-n`: Non-GUI mode
- `-t`: Test plan file
- `-l`: Results file (JTL format)
- `-e`: Generate HTML report
- `-o`: Output folder for HTML report

After execution, open `report/index.html` in a browser to view the detailed HTML report.

### Option 3: Custom Parameters from Command Line

```bash
jmeter -n -t performance-test.jmx -l results.jtl ^
  -JHOST=localhost ^
  -JPORT=3000 ^
  -Jthreads=200 ^
  -Jrampup=30 ^
  -Jloops=5
```

## Understanding the Test Flow

Each virtual user performs the following sequence:

1. **Login** (POST /api/auth/login)
   - Authenticates with username/password
   - Extracts JWT token from response

2. **Get Projects** (GET /api/projects)
   - Fetches list of all projects
   - Extracts first project ID for subsequent requests

3. **Get Project Details** (GET /api/projects/{id})
   - Retrieves detailed information for a specific project

4. **Get Elemcsoport** (GET /api/projects/{id}/elemcsoport)
   - Fetches element groups for the project
   - Extracts first elemcsoport ID

5. **Get Items** (GET /api/projects/{id}/elemcsoport/{id}/items)
   - Retrieves items within an element group

6. **Get Users** (GET /api/protected/users)
   - Fetches user list (if authorized)

7. **Think Time**: 1 second pause between iterations

## Key Metrics to Monitor

### Response Time Metrics
- **Average Response Time**: Target < 500ms for most endpoints
- **90th Percentile**: Target < 1000ms
- **95th Percentile**: Target < 1500ms
- **99th Percentile**: Target < 3000ms

### Throughput
- **Requests per Second**: Higher is better
- **Total Throughput (KB/sec)**: Measure data transfer rate

### Error Rate
- **Error %**: Target 0% for all requests
- Monitor HTTP response codes (should all be 200 for successful tests)

### Server Resources
Monitor on the server side:
- CPU usage
- Memory consumption
- Database connections
- Query execution time

## Interpreting Results

### Summary Report
Shows aggregate statistics for each request type:
- **Label**: Request name
- **# Samples**: Total number of requests
- **Average**: Average response time
- **Min/Max**: Fastest and slowest response times
- **Std. Dev.**: Standard deviation (consistency of response times)
- **Error %**: Percentage of failed requests
- **Throughput**: Requests per second
- **Received KB/sec**: Data received rate
- **Sent KB/sec**: Data sent rate

### Aggregate Report
Provides additional percentile metrics:
- **Median**: 50th percentile response time
- **90% Line**: 90th percentile
- **95% Line**: 95th percentile
- **99% Line**: 99th percentile

### Graph Results
Visual representation showing:
- Response time trends over time
- Throughput variations
- Deviation patterns

## Customization

### Adjusting Load
Edit thread group settings to simulate different scenarios:

**Light Load (50 users)**
```xml
<stringProp name="ThreadGroup.num_threads">50</stringProp>
<stringProp name="ThreadGroup.ramp_time">10</stringProp>
```

**Heavy Load (500 users)**
```xml
<stringProp name="ThreadGroup.num_threads">500</stringProp>
<stringProp name="ThreadGroup.ramp_time">60</stringProp>
```

**Stress Test (1000 users)**
```xml
<stringProp name="ThreadGroup.num_threads">1000</stringProp>
<stringProp name="ThreadGroup.ramp_time">120</stringProp>
```

### Adding More Test Users

If you need more than 20 test users for larger load tests:

1. Add more entries to `test-users.csv`
2. Create corresponding users in database using `create-test-users.sql` as template
3. Update CSV Data Set Config in JMeter to recycle users if needed

### Testing Specific Endpoints

You can disable/enable specific HTTP requests in JMeter:
- Right-click on request → Enable/Disable
- This allows you to focus on specific parts of the application

## Troubleshooting

### "Connection refused" errors
- Ensure backend server is running: `npm run dev`
- Verify server is listening on port 3000
- Check firewall settings

### "401 Unauthorized" errors
- Verify test users exist in database
- Check JWT token extraction in "Extract JWT Token" post-processor
- Ensure Authorization header is properly set

### "404 Not Found" errors
- Verify API endpoints match your application routes
- Ensure test data (projects, elemcsoport, items) exists
- Check path variables are correctly extracted

### Poor Performance Results
- Check database indexes are in place
- Monitor database query performance
- Verify server has adequate resources (CPU, RAM)
- Consider connection pooling settings
- Check for N+1 query problems

### CSV file not found
- Ensure `test-users.csv` is in the same directory as the .jmx file
- Or provide absolute path in CSV Data Set Config

## Best Practices

1. **Warm-up**: Run a short test first to warm up the application
2. **Baseline**: Establish baseline performance with low load first
3. **Gradual Increase**: Incrementally increase load to find breaking points
4. **Monitor**: Watch server resources during tests
5. **Cleanup**: Clear logs and temp data between major test runs
6. **Realistic Scenarios**: Adjust think times to simulate real user behavior
7. **Test Environment**: Use a dedicated test environment, not production

## Advanced: Continuous Performance Testing

Integrate with CI/CD pipeline:

```bash
# Run test and fail if error rate > 1%
jmeter -n -t performance-test.jmx -l results.jtl
# Parse results.jtl and check error rate
```

## Files in This Directory

- `performance-test.jmx`: Main JMeter test plan
- `test-users.csv`: CSV file with test user credentials
- `create-test-users.sql`: SQL script to create test users
- `README.md`: This documentation file

## Support

For issues or questions:
1. Check JMeter logs: `jmeter.log` in JMeter installation directory
2. Review JMeter documentation: https://jmeter.apache.org/usermanual/
3. Check PreERP application logs for backend errors

## License

This performance test suite is part of the PreERP project.
