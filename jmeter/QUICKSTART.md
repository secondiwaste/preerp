# Quick Start Guide - JMeter Performance Testing

## 🚀 Quick Start (5 minutes)

### Step 1: Install JMeter (if not already installed)

**Windows:**
1. Download Apache JMeter from https://jmeter.apache.org/download_jmeter.cgi
2. Extract to `C:\apache-jmeter` (or your preferred location)
3. Add `C:\apache-jmeter\bin` to your PATH environment variable
4. Verify installation: Open Command Prompt and type `jmeter -v`

**Alternative - Using Chocolatey:**
```powershell
choco install jmeter
```

### Step 2: Create Test Users in Database

Open MySQL and run:
```bash
mysql -u root -p preerp < create-test-users.sql
```

This creates 20 test users (testuser1 through testuser20) with password `TestPass123!`

### Step 3: Ensure Backend is Running

```bash
cd D:\Work\preerp
npm run dev
```

Verify server is running at http://localhost:3000

### Step 4: Run the Performance Test

**Option A - Using PowerShell Script (Recommended):**
```powershell
cd jmeter
.\run-test.ps1
```

**Option B - Using Batch Script:**
```cmd
cd jmeter
run-test.bat
```

**Option C - Using JMeter GUI:**
```bash
cd jmeter
jmeter -t performance-test.jmx
```
Then click the green play button in JMeter GUI.

**Option D - Direct Command Line:**
```bash
cd jmeter
jmeter -n -t performance-test.jmx -l results.jtl -e -o report
```

### Step 5: View Results

The test will automatically open the HTML report in your browser when complete.

Alternatively, navigate to:
- `jmeter/results/test-[timestamp]/html-report/index.html`

---

## 📊 Understanding the Results

### Key Metrics to Watch

1. **Response Time**
   - Average should be < 500ms
   - 95th percentile should be < 1500ms
   - Look for trends and spikes

2. **Throughput**
   - Requests per second
   - Higher is better
   - Should remain stable during test

3. **Error Rate**
   - Target: 0%
   - Any errors indicate problems

4. **Server Resources**
   - Monitor CPU and memory usage
   - Check database connections
   - Watch for resource exhaustion

---

## 🔧 Common Customizations

### Change Number of Users

**PowerShell:**
```powershell
.\run-test.ps1 -Threads 500
```

**Batch:**
```cmd
run-test.bat 500
```

**Direct Edit:**
Open `performance-test.jmx` in text editor, find:
```xml
<stringProp name="ThreadGroup.num_threads">200</stringProp>
```
Change 200 to your desired value.

### Change Ramp-Up Time

**PowerShell:**
```powershell
.\run-test.ps1 -Threads 200 -RampUp 60
```

This starts 200 users over 60 seconds (instead of 30).

### Change Loop Count

**PowerShell:**
```powershell
.\run-test.ps1 -Threads 200 -RampUp 30 -Loops 10
```

Each user will execute the test scenario 10 times.

### Test Different Server

**PowerShell:**
```powershell
.\run-test.ps1 -Host 192.168.1.100 -Port 3000
```

---

## 🎯 Test Scenarios

### Scenario 1: Light Load (Baseline)
```powershell
.\run-test.ps1 -Threads 10 -RampUp 5 -Loops 3
```
Use this to establish baseline performance.

### Scenario 2: Normal Load
```powershell
.\run-test.ps1 -Threads 50 -RampUp 10 -Loops 5
```
Simulates typical production usage.

### Scenario 3: Peak Load
```powershell
.\run-test.ps1 -Threads 200 -RampUp 30 -Loops 5
```
Tests behavior under high load.

### Scenario 4: Stress Test
```powershell
.\run-test.ps1 -Threads 500 -RampUp 60 -Loops 10
```
Finds breaking point of the system.

### Scenario 5: Spike Test
```powershell
.\run-test.ps1 -Threads 1000 -RampUp 10 -Loops 2
```
Rapid spike in users (tests recovery).

---

## ❗ Troubleshooting

### "JMeter not found"
- Ensure JMeter bin directory is in PATH
- Try using full path: `C:\apache-jmeter\bin\jmeter -v`

### "Connection refused"
- Check if backend server is running: `npm run dev`
- Verify server is on port 3000
- Check firewall settings

### "401 Unauthorized"
- Ensure test users are created in database
- Run `create-test-users.sql` again
- Verify password hash is correct

### "404 Not Found"
- Ensure database has test data (projects, elemcsoport, items)
- Create at least one project through the UI before testing

### High Error Rate
- Check server logs for errors
- Verify database connection
- Ensure adequate server resources

### Poor Performance
- Check database indexes
- Monitor server CPU/RAM usage
- Review slow query logs
- Consider optimizing database queries

---

## 📈 Performance Benchmarks

### Expected Results (on typical development machine)

| Metric | Light (10 users) | Normal (50 users) | Peak (200 users) |
|--------|------------------|-------------------|------------------|
| Avg Response Time | < 100ms | < 300ms | < 500ms |
| 95th Percentile | < 200ms | < 600ms | < 1000ms |
| Throughput | 20-30 req/s | 80-100 req/s | 200-300 req/s |
| Error Rate | 0% | 0% | < 0.1% |

*Note: Results vary based on hardware, database size, and network conditions.*

---

## 🔄 Next Steps After Testing

1. **Analyze Results**
   - Identify slowest endpoints
   - Look for error patterns
   - Note resource bottlenecks

2. **Optimize**
   - Add database indexes
   - Optimize slow queries
   - Implement caching
   - Adjust connection pools

3. **Re-test**
   - Run same test again
   - Compare before/after metrics
   - Verify improvements

4. **Document**
   - Record baseline metrics
   - Track optimization results
   - Set performance SLAs

---

## 📚 Additional Resources

- [JMeter User Manual](https://jmeter.apache.org/usermanual/)
- [Best Practices](https://jmeter.apache.org/usermanual/best-practices.html)
- [Performance Testing Tutorial](https://jmeter.apache.org/usermanual/boss.html)

---

## 💡 Tips

- **Always warm up**: Run a small test first
- **Consistent environment**: Use same server state for comparisons
- **Monitor resources**: Watch CPU, RAM, disk, network
- **Test incrementally**: Gradually increase load
- **Regular testing**: Make performance testing part of CI/CD
- **Realistic data**: Use production-like data volumes
- **Think times**: Add realistic pauses between requests
- **Clean up**: Clear logs and temp files between major tests

---

## 📞 Support

If you encounter issues:
1. Check `jmeter.log` in the results directory
2. Review backend server logs
3. Verify database connection and data
4. Consult the main README.md for detailed information

Happy Testing! 🚀
