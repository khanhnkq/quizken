/**
 * Device detection utilities for performance optimization
 */

export interface DeviceInfo {
  isMobile: boolean;
  isLowEnd: boolean;
  isTouchDevice: boolean;
  hardwareConcurrency: number;
  memoryEstimate?: number;
}

/**
 * Detect if device is mobile based on screen width and user agent
 */
export const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  return (
    window.innerWidth < 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
};

/**
 * Detect if device is low-end based on hardware capabilities
 */
export const isLowEndDevice = (): boolean => {
  if (typeof navigator === "undefined") return false;

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 1;
  if (cores < 4) return true;

  // Check memory if available
  if ("memory" in performance) {
    const memory = (performance as any).memory;
    if (memory && memory.jsHeapSizeLimit < 1073741824) {
      // Less than 1GB
      return true;
    }
  }

  // Check connection speed if available
  if ("connection" in navigator) {
    const connection = (navigator as any).connection;
    if (connection && connection.effectiveType === "slow-2g") {
      return true;
    }
  }

  return false;
};

/**
 * Detect if device supports touch
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === "undefined") return false;

  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

/**
 * Get comprehensive device information
 */
export const getDeviceInfo = (): DeviceInfo => {
  const isMobile = isMobileDevice();
  const isLowEnd = isLowEndDevice();
  const isTouch = isTouchDevice();
  const cores = navigator.hardwareConcurrency || 1;

  let memoryEstimate: number | undefined;
  if ("memory" in performance) {
    const memory = (performance as any).memory;
    memoryEstimate = memory?.jsHeapSizeLimit;
  }

  return {
    isMobile,
    isLowEnd,
    isTouchDevice: isTouch,
    hardwareConcurrency: cores,
    memoryEstimate,
  };
};

/**
 * Check if animations should be reduced for performance
 */
export const shouldReduceAnimations = (): boolean => {
  const deviceInfo = getDeviceInfo();

  // Reduce animations on mobile or low-end devices
  return deviceInfo.isMobile || deviceInfo.isLowEnd;
};

/**
 * Check if ScrollSmoother should be disabled
 */
export const shouldDisableScrollSmoother = (): boolean => {
  const deviceInfo = getDeviceInfo();

  // Disable on mobile devices for better performance
  return deviceInfo.isMobile;
};

/**
 * Detect iOS Safari (including iPadOS masquerading as macOS with touch support).
 * Used to conditionally mitigate focus-induced auto scrolling on radio inputs.
 */
export const isIOSSafari = (): boolean => {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent || "";
  const vendor = (navigator as any).vendor || "";

  // iPadOS often reports as Macintosh + touch points
  const isIPadOSMac =
    /Macintosh/.test(ua) &&
    typeof navigator.maxTouchPoints === "number" &&
    navigator.maxTouchPoints > 1;
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || isIPadOSMac;

  // Safari on iOS: UA contains "Safari" but not Chrome/CriOS/EdgiOS/FxiOS
  const hasSafariToken = /Safari/.test(ua);
  const isNotChromiumOrEdgeOrFirefox = !/(Chrome|CriOS|EdgiOS|FxiOS)/.test(ua);

  // Apple vendor string is present on Safari
  const isAppleVendor = /Apple Computer/i.test(vendor);

  return (
    isIOSDevice &&
    hasSafariToken &&
    isNotChromiumOrEdgeOrFirefox &&
    isAppleVendor
  );
};
