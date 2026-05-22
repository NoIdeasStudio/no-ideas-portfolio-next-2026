export function InfoPageFooter() {
  return (
    <footer
      className="info-page-footer info-section-row"
      aria-label="Copyright and newsletter"
    >
      <p className="info-page-footer-copyright text-4-12">
        © {new Date().getFullYear()} No Ideas
      </p>
      {process.env.NEXT_PUBLIC_MAILCHIMP_FORM_ACTION ? (
        <div className="text-4-12 info-mailchimp-form-col">
          <form
            id="mc-embedded-subscribe-form"
            name="mc-embedded-subscribe-form"
            className="info-mailchimp-form validate"
            action={process.env.NEXT_PUBLIC_MAILCHIMP_FORM_ACTION}
            method="post"
            target="_blank"
            noValidate
          >
            {process.env.NEXT_PUBLIC_MAILCHIMP_HONEYPOT_NAME ? (
              <div className="info-mailchimp-hp" aria-hidden="true">
                <input
                  type="text"
                  name={process.env.NEXT_PUBLIC_MAILCHIMP_HONEYPOT_NAME}
                  tabIndex={-1}
                  defaultValue=""
                  autoComplete="off"
                />
              </div>
            ) : null}
            <div className="info-mailchimp-form-fields">
              <input
                id="mce-EMAIL"
                type="email"
                name="EMAIL"
                className="info-mailchimp-input required email"
                placeholder="Newsletter"
                autoComplete="email"
                required
                aria-label="Email for newsletter"
              />
              <input
                type="submit"
                name="subscribe"
                id="mc-embedded-subscribe"
                className="info-mailchimp-submit"
                value="Submit"
              />
            </div>
          </form>
        </div>
      ) : null}
    </footer>
  )
}
