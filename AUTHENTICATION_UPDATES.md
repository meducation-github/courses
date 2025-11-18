# Authentication System Updates

This document describes the updates made to add direct login functionality to the MEducation Courses app.

## Summary of Changes

The authentication system has been enhanced to support **both direct login** (email/password) and the existing **URL token-based authentication** from external websites.

## What's New

### 1. shadcn/ui Configuration ✅

- Installed and configured shadcn/ui component library
- Added CSS variables for theming in `src/style/index.css`
- Created `src/lib/utils.js` with `cn()` helper function
- Installed components: Button, Input, Card, Label
- Created `components.json` and `jsconfig.json` for configuration

### 2. Login Page (`src/pages/auth/Login.jsx`) ✅

A new, beautiful login page with:

- **Email/Password Login**: Direct authentication using Supabase Auth
- **Sign Up Support**: New users can create accounts
- **URL Token Authentication**: Automatically handles `access_token` and `refresh_token` from URL
- **External Login Option**: Button to redirect to `meducation.pk/login` for existing portal users
- **Modern UI**: Built with shadcn/ui components with gradient background
- **Toast Notifications**: User feedback for success/error states

### 3. Updated Authentication Context (`src/context/userContext.jsx`) ✅

Enhanced the UserProvider with:

- **Auth State Listener**: Automatically listens to Supabase auth state changes
- **Automatic Profile Fetching**: Fetches user profile and role when authenticated
- **Loading State**: Proper loading state management
- **Session Management**: Uses `getSession()` and `onAuthStateChange()`
- **Role Detection**: Automatically determines if user is student or staff

### 4. Updated Routing (`src/main.jsx`) ✅

- Added public `/login` route outside protected routes
- Added `Toaster` component for app-wide toast notifications
- Maintained all existing protected routes

### 5. Updated App Component (`src/App.jsx`) ✅

- Removed duplicate auth logic (now handled by context)
- Uses loading state from context
- Redirects to `/login` instead of external URL
- Added `Toaster` for notifications

### 6. Updated Protected Routes (`src/components/ProtectedRoute.jsx`) ✅

- Redirects to `/login` instead of returning null
- Maintains role-based access control
- Uses `Navigate` component for proper redirects

### 7. Updated Auth Utils (`src/utils/authUtils.js`) ✅

- `getRedirectUrl()`: Now returns `/login` instead of external URL
- Added `redirectToExternalLogin()`: For users who want to use the main portal

## How It Works

### Direct Login Flow

1. User visits app without authentication
2. Automatically redirected to `/login`
3. User enters email and password
4. Supabase authenticates the user
5. Context fetches user profile from `students` or `staff` table
6. User is redirected to `/courses`

### URL Token Login Flow (Existing)

1. User clicks link from external site with tokens:
   ```
   http://localhost:5174/login?access_token=xxx&refresh_token=yyy
   ```
2. Login page detects tokens in URL
3. Sets Supabase session with tokens
4. Cleans tokens from URL
5. User is authenticated and redirected to `/courses`

### Sign Up Flow (New)

1. User clicks "Sign up" on login page
2. Enters email and password
3. Supabase creates new auth user
4. User receives verification email
5. After verification, admin must add user to `students` or `staff` table with their `user_id`

## Role-Based Access

- **Students**: Can view courses at `/courses` but cannot access `/create-courses`
- **Staff**: Can access all routes including `/create-courses`

## Database Requirements

### For New Users

When a new user signs up, an admin must add them to either the `students` or `staff` table with:

```sql
-- For students
INSERT INTO students (user_id, first_name, last_name, email, institute_id, ...)
VALUES ('auth-user-id', 'John', 'Doe', 'john@example.com', 'institute-uuid', ...);

-- For staff
INSERT INTO staff (user_id, name, email, institute_id, ...)
VALUES ('auth-user-id', 'Jane Smith', 'jane@example.com', 'institute-uuid', ...);
```

**Note**: The `user_id` must match the `id` from `auth.users` table.

## Environment Variables

Ensure these are set in your `.env` file:

```env
VITE_SUPABASE_PROD_API_KEY=your-anon-key
VITE_SUPABASE_ADMIN_SERVICE_ROLE_KEY=your-service-role-key
```

## Security Considerations

1. **Password Security**: Minimum 6 characters enforced
2. **Token Handling**: Tokens are automatically cleaned from URL after authentication
3. **Session Management**: Automatic session refresh handled by Supabase
4. **Role Validation**: Server-side validation should be implemented for sensitive operations
5. **Email Verification**: Users must verify email (can be configured in Supabase dashboard)

## Testing the System

### Test Direct Login

1. Navigate to `http://localhost:5174/`
2. You'll be redirected to `/login`
3. Enter your email and password
4. Click "Sign In"
5. Should redirect to `/courses` upon success

### Test URL Token Login

1. Get access and refresh tokens from external auth
2. Visit: `http://localhost:5174/login?access_token=xxx&refresh_token=yyy`
3. Should automatically authenticate and redirect to `/courses`

### Test Sign Up

1. Navigate to `/login`
2. Click "Don't have an account? Sign up"
3. Enter email and password
4. Click "Sign Up"
5. Check email for verification link
6. Admin adds user to `students` or `staff` table
7. User can then login

### Test External Login

1. Navigate to `/login`
2. Click "Login via MEducation Portal"
3. Should redirect to `https://meducation.pk/login`

## UI/UX Improvements

- **Modern Design**: Gradient background with shadcn/ui components
- **Responsive**: Works on all screen sizes
- **Loading States**: Shows loading spinner during authentication
- **Error Handling**: Clear error messages with toast notifications
- **Mode Switching**: Easy toggle between login and signup modes

## Backward Compatibility

✅ **Full backward compatibility maintained**

- Existing URL token authentication still works
- External login redirect still available as an option
- All existing protected routes unchanged
- Role-based access control preserved

## Next Steps (Optional Enhancements)

1. **Password Reset**: Add forgot password functionality
2. **OAuth Providers**: Add Google/Microsoft login
3. **Admin Panel**: Create UI for admins to add users to tables
4. **Profile Management**: Allow users to update their profiles
5. **Two-Factor Authentication**: Add extra security layer

## Files Modified

- ✅ `src/pages/auth/Login.jsx` (new)
- ✅ `src/lib/utils.js` (new)
- ✅ `components.json` (new)
- ✅ `jsconfig.json` (new)
- ✅ `src/style/index.css` (updated with theme variables)
- ✅ `src/main.jsx` (added /login route)
- ✅ `src/App.jsx` (simplified auth logic)
- ✅ `src/context/userContext.jsx` (enhanced with auth listener)
- ✅ `src/components/ProtectedRoute.jsx` (updated redirect)
- ✅ `src/utils/authUtils.js` (updated redirect URLs)
- ✅ `package.json` (added tailwind-merge, class-variance-authority)

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify environment variables are set correctly
3. Ensure user exists in `students` or `staff` table
4. Check Supabase dashboard for auth users

---

**Status**: ✅ Implementation Complete
**Last Updated**: 2025-11-18
**Version**: 2.0
