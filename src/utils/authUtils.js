// Utility functions for authentication and redirects

export const getRedirectUrl = (userRole, currentPath = "") => {
  // Redirect to local login page, with fallback to external login
  return "/login";
};

export const redirectToLogin = (userRole = null, currentPath = "") => {
  const redirectUrl = getRedirectUrl(userRole, currentPath);
  window.location.href = redirectUrl;
};

export const redirectToExternalLogin = () => {
  // For users who want to login via the main MEducation portal
  window.location.href = "https://meducation.pk/login";
};

export const isAccessTokenInUrl = () => {
  // Check query parameters first
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("access_token") && urlParams.get("refresh_token")) {
    console.log("🔍 Found tokens in query parameters");
    return true;
  }

  // Check hash fragment
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const hasHashTokens =
    hashParams.get("access_token") && hashParams.get("refresh_token");
  if (hasHashTokens) {
    console.log("🔍 Found tokens in hash fragment");
  }
  return hasHashTokens;
};

export const cleanUrlParams = () => {
  // Remove access_token and refresh_token from URL
  const url = new URL(window.location);

  // Clean query parameters
  url.searchParams.delete("access_token");
  url.searchParams.delete("refresh_token");
  url.searchParams.delete("expires_at");
  url.searchParams.delete("expires_in");
  url.searchParams.delete("token_type");
  url.searchParams.delete("type");

  // Clean hash fragment
  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  if (hashParams.get("access_token")) {
    hashParams.delete("access_token");
    hashParams.delete("refresh_token");
    hashParams.delete("expires_at");
    hashParams.delete("expires_in");
    hashParams.delete("token_type");
    hashParams.delete("type");

    const newHash = hashParams.toString();
    window.history.replaceState(
      {},
      document.title,
      url.pathname + url.search + (newHash ? "#" + newHash : "")
    );
  } else {
    window.history.replaceState({}, document.title, url.pathname + url.search);
  }
};
