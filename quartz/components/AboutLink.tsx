import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

const AboutLink: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <a href="/About" class={`about-link ${displayClass ?? ""}`}>
      About
    </a>
  )
}

AboutLink.css = `
.about-link {
  font-size: 20px;
  font-weight: 400;
  color: var(--secondary) !important;
  text-decoration: none;
  margin-right: 1.5rem; /* Pushes the moon a bit to the right */
  transition: color 0.2s ease;
}
.about-link:hover {
  color: #3AA99F !important;
}
@media all and (max-width: 768px) {
  .about-link {
    font-size: 16.5px;
    margin-right: 1rem;
  }
}
`

export default (() => AboutLink) satisfies QuartzComponentConstructor
