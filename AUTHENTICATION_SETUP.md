# MEd Courses Authentication System

This document describes the authentication system implemented for the MEd Courses React application.

## Overview

The authentication system supports two types of users:

- **Students**: Can view courses but cannot create/edit them
- **Staff**: Can view and create/edit courses

## Features

### 1. Auto-Login with Access Tokens

- Users can be automatically logged in using `access_token` and `refresh_token` URL parameters
- Tokens are automatically cleaned from the URL after successful authentication
- Supports one-click login from external websites

### 2. Role-Based Access Control

- **All Users**: Shown a login button that redirects to `meducation.pk/login` if not authenticated
- Students cannot access `/create-courses` routes
- Staff have full access to all routes

### 3. Database Integration

- Fetches user profile from `students` or `staff` tables based on `user_id`
- Automatically fetches institute information using `institute_id`
- Handles cases where users are not found in either table

## Database Schema

### Students Table

```sql
create table public.students (
  id uuid not null default extensions.uuid_generate_v4 (),
  first_name text null,
  last_name text null,
  father_name text null,
  address text null,
  grade uuid null,
  status text null,
  phone text null,
  email text null,
  date_of_birth date null,
  admission_date date null,
  institute_id uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  session_id uuid null,
  user_id uuid null, -- Links to auth.users.id
  metadata jsonb null,
  profile text null,
  parent_id uuid null,
  constraint students_pkey primary key (id),
  constraint students_user_id_fkey foreign KEY (user_id) references auth.users (id)
);
```

### Staff Table

```sql
create table public.staff (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  email text not null,
  phone text null,
  department text null,
  designation text null,
  address text null,
  joining_date date null,
  salary numeric null,
  is_active boolean null default true,
  institute_id uuid not null, -- Links to institutes.id
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  user_id uuid null, -- Links to auth.users.id
  role text null,
  permissions jsonb null,
  status text null,
  profile text null,
  public boolean null default true,
  courses jsonb null,
  constraint staff_pkey primary key (id),
  constraint staff_user_id_fkey foreign KEY (user_id) references auth.users (id)
);
```

### Institutes Table

```sql
create table public.institutes (
  id uuid not null default extensions.uuid_generate_v4 (),
  name text not null,
  address text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  type text null,
  map text null,
  logo text null,
  session_id uuid null,
  city text null,
  province text null,
  tagline text null,
  colors jsonb null,
  plan text null default 'free'::text,
  constraint institutes_pkey primary key (id)
);
```

## Implementation Details

### 1. Authentication Context (`src/context/userContext.jsx`)

- Manages user authentication state
- Handles auto-login with URL tokens
- Fetches user profile and institute data
- Provides role-based utility functions

### 2. Protected Routes (`src/components/ProtectedRoute.jsx`)

- Wraps routes that require authentication
- Enforces role-based access control
- Handles redirects for unauthorized access

### 3. Utility Functions (`src/utils/authUtils.js`)

- `getRedirectUrl()`: Determines appropriate login URL
- `redirectToLogin()`: Performs redirect to login
- `isAccessTokenInUrl()`: Checks for auto-login tokens
- `cleanUrlParams()`: Removes tokens from URL

### 4. Custom Hook (`src/hooks/useAuth.js`)

- Provides easy access to authentication context
- Throws error if used outside AuthProvider

## Usage Examples

### Auto-Login URL

```
https://your-domain.com/courses?access_token=xxx&refresh_token=yyy
```

### Using Authentication in Components

```jsx
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { user, userRole, institute, isStudent, isStaff, logout } = useAuth();

  if (isStudent()) {
    return <div>Student view</div>;
  }

  if (isStaff()) {
    return <div>Staff view</div>;
  }

  return <div>Loading...</div>;
}
```

### Protected Routes

```jsx
// Staff-only route
<Route
  path="/create-courses"
  element={
    <ProtectedRoute requiredRole="staff">
      <CreateCourses />
    </ProtectedRoute>
  }
/>

// Any authenticated user
<Route
  path="/courses"
  element={
    <ProtectedRoute>
      <Courses />
    </ProtectedRoute>
  }
/>
```

## Redirect Logic

### Unauthenticated Users

- **All Users**: Shown a login button that redirects to `https://meducation.pk/login` when clicked

### Role-Based Redirects

- Students trying to access `/create-courses` → redirected to `/courses`
- Staff can access all routes
- Unauthorized access → shown login button that redirects to `https://meducation.pk/login`

## Environment Variables

Make sure these environment variables are set:

- `VITE_SUPABASE_PROD_API_KEY`: Supabase anon key
- `VITE_SUPABASE_ADMIN_SERVICE_ROLE_KEY`: Supabase service role key

## Security Considerations

1. **Token Handling**: Access tokens are automatically cleaned from URL
2. **Role Validation**: Server-side validation should be implemented for sensitive operations
3. **Session Management**: Automatic session refresh and logout on token expiration
4. **Database Security**: Ensure proper RLS policies are in place

## Testing

To test the authentication system:

1. **Auto-Login**: Add `?access_token=xxx&refresh_token=yyy` to URL
2. **Role Access**: Try accessing `/create-courses` as a student
3. **Redirects**: Test with invalid tokens or expired sessions
4. **Cross-Domain**: Test redirects between student and staff domains
