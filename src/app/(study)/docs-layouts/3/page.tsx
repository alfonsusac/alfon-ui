import Color from "colorjs.io"

export default function Test() {
  try {
    const input = "oklab(0.615061 -3.57628e-7 4.76837e-7 / 0.75)"
    console.log("Input: ", input)
    const color = new Color(input)
    console.log(color.to("oklab").toString())
  } catch (error) {
    console.log("TestError: ", error)
  }

  return <></>
}