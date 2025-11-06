# Frontend-Backend Integration Checklist

## ✅ Pre-flight Checks

### Backend Setup
- [ ] MongoDB is running and connected
- [ ] Environment variables are set (`.env` file):
  - `MONGODB_URI`
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
  - `TWILIO_WEBHOOK_BASE_URL`
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_API_TOKEN`
  - `ELEVENLABS_API_KEY`
- [ ] Backend is running on `http://localhost:3000`
- [ ] API is accessible at `http://localhost:3000/v1`
- [ ] Swagger docs available at `http://localhost:3000/v1/docs`

### Frontend Setup
- [ ] Node modules installed (`npm install` or `yarn install`)
- [ ] Environment variable set:
  - Create `.env` file with `VITE_API_URL=http://localhost:3000/v1`
- [ ] Frontend is running on `http://localhost:5173` (or Vite default port)

## 🔍 Verification Steps

### 1. Test API Connection
1. Open browser console
2. Navigate to frontend
3. Check for any CORS errors in console
4. Try to access `http://localhost:3000/v1` in browser (should see health check or 404)

### 2. Test Authentication (if required)
- [ ] Login flow works
- [ ] Token is stored in localStorage as `access_token`
- [ ] API calls include Authorization header

### 3. Test Test Configuration Endpoints

**Create Test:**
```bash
# Should work via UI or test with curl:
curl -X POST http://localhost:3000/v1/tests \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Config",
    "agentEndpoint": "+1234567890",
    "language": {
      "code": "ar",
      "dialect": "egyptian",
      "name": "Arabic"
    },
    "persona": "polite_customer",
    "scenarioTemplate": "I need to book an appointment"
  }'
```

**List Tests:**
```bash
curl http://localhost:3000/v1/tests
```

### 4. Test Test Run Endpoints

**Create Test Run:**
```bash
curl -X POST http://localhost:3000/v1/test-runs \
  -H "Content-Type: application/json" \
  -d '{
    "testConfigId": "<test-config-id>"
  }'
```

**Get Test Run:**
```bash
curl http://localhost:3000/v1/test-runs/<test-run-id>
```

## 🐛 Common Issues & Solutions

### Issue: CORS Errors
**Solution:** Backend CORS is configured to allow all origins (`origin: true`). If you see CORS errors:
- Check backend is running
- Verify CORS config in `main.ts`
- Check browser console for specific CORS error

### Issue: 401 Unauthorized
**Possible causes:**
- Tests endpoints might require authentication (check backend)
- Token expired or invalid
- Frontend not sending token correctly

**Solution:**
- If tests don't require auth, remove `@UseGuards` from controllers or add `@Public()` decorator
- Check token in localStorage
- Verify API client interceptor is adding token

### Issue: 404 Not Found
**Possible causes:**
- Wrong API URL
- Backend not running
- Wrong route path

**Solution:**
- Verify `VITE_API_URL` in frontend `.env`
- Check backend is running on correct port
- Verify API prefix is `/v1` in backend

### Issue: Data Format Mismatch
**Possible causes:**
- Backend response format doesn't match frontend expectations
- DTO validation errors

**Solution:**
- Check backend response format (should be wrapped in `BaseResponseDto`)
- Verify DTO fields match between frontend types and backend DTOs
- Check browser network tab for actual response

### Issue: MongoDB Connection
**Error:** `MongoServerError` or connection timeout

**Solution:**
- Verify MongoDB is running
- Check `MONGODB_URI` in backend `.env`
- Test MongoDB connection separately

## 🧪 Manual Testing Flow

1. **Start Backend:**
   ```bash
   cd velto-api
   npm run start:dev
   # Should see: "🚀 Application is running on: http://localhost:3000/v1"
   ```

2. **Start Frontend:**
   ```bash
   cd velto-web
   npm run dev
   # Should see: "Local: http://localhost:5173"
   ```

3. **Test in Browser:**
   - Open `http://localhost:5173`
   - Navigate to `/tests` (may need to login first)
   - Create a test configuration
   - Run a test
   - View results

4. **Check Network Tab:**
   - Open browser DevTools → Network tab
   - Verify API calls are going to correct URL
   - Check request/response payloads
   - Look for errors (4xx, 5xx status codes)

## 📝 Notes

- **Authentication:** Currently, tests endpoints don't have `@UseGuards`, so they should work without auth. However, frontend routes are protected, so you'll need to login or bypass auth check.
- **Token Storage:** Frontend uses `access_token` in AuthContext but API client checks both `access_token` and `token` for compatibility.
- **Response Format:** Backend wraps all responses in `BaseResponseDto` with `{ success, message, data }` structure. Frontend expects this format.

## ✅ Success Criteria

Frontend and backend are working together when:
- [ ] Can create test configuration via UI
- [ ] Can see test list
- [ ] Can run a test
- [ ] Can see test results with polling
- [ ] No console errors
- [ ] No CORS errors
- [ ] API calls return expected data format

