export function getEyedropperAPI() {
  // Check if browser supports the EyeDropper API

  // @ts-ignore
  if (!global.EyeDropper) {
    return {
      support: false,
    } as const
  }

  return {
    support: true,
    async getColor() {
      const eyeDropper = new (global as any).EyeDropper()
      try {
        const result = await eyeDropper.open()
        return result.sRGBHex as string
      } catch (e) {
        console.error(e)
        return null
      }
    },
  }
}
