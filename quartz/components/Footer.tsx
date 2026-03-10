import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/footer.scss"
import { version } from "../../package.json"
import { i18n } from "../i18n"

interface Options {
  links: Record<string, string>
}

export default ((opts?: Options) => {
  const Footer: QuartzComponent = ({ displayClass, cfg }: QuartzComponentProps) => {
    const year = new Date().getFullYear()
    const links = opts?.links ?? []
    return (
      <footer class={`${displayClass ?? ""}`}>
        {/* Steph Ango conversational text style */}
        <div class="social-text">
          Follow me on <a href="YOUR_INSTAGRAM_LINK_HERE">Instagram</a>, and join the <a href="YOUR_DISCORD_LINK_HERE">Discord Community</a>.
        </div>

        {/* The optical alignment target */}
        <a href="/about" class="footer-logo">
          <img src="/static/icon.png" alt="About Zeroth Layer" />
        </a>
      </footer>
    )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
