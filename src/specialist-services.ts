export const specialistPaths = [
  "/erp-development-services",
  "/crm-development-services",
  "/saas-development-services",
  "/api-development-services",
  "/blockchain-development-services",
  "/iot-development-services",
  "/ar-vr-development-services",
  "/legacy-software-modernisation",
];
export function specialistMode(path: string) {
  return /api|blockchain|iot/.test(path)
    ? "connected"
    : /ar-vr/.test(path)
      ? "immersive"
      : /legacy/.test(path)
        ? "modernisation"
        : "platform";
}
