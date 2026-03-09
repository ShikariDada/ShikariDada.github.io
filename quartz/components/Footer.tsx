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
            {/* The social links render FIRST */}
            <ul>
              {Object.entries(links).map(([text, link]) => (
                <li>
                  <a href={link}>{text}</a>
                </li>
              ))}
            </ul>

            {/* Your logo renders SECOND (below the links) */}
            <a href="/About" class="footer-logo">
              <img src="/static/icon.png" alt="About Zeroth Layer" />
            </a>
          </footer>
        )
  }

  Footer.css = style
  return Footer
}) satisfies QuartzComponentConstructor
