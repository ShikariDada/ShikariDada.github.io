import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const AboutLink: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <a href="/blog/about" class={`about-link ${displayClass ?? ""}`}>
      About
    </a>
  )
}

AboutLink.css = `
.about-link {
  font-size: 1rem;
  font-weight: 400;
  color: #6F6E69;
  text-decoration: none;
  margin-right: 1.25rem;
  transition: color 0.15s ease;
}
.about-link:hover {
  color: var(--secondary);
}
@media all and (max-width: 860px) {
  .about-link {
    font-size: 1rem;
    margin-right: 1rem;
  }
}
`

export default (() => AboutLink) satisfies QuartzComponentConstructor
