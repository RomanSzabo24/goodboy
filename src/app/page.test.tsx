import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import Page from "./page"

describe("Home page", () => {
  it("renders", () => {
    render(<Page />)
    expect(screen.getByRole("main")).toBeInTheDocument()
  })
})
