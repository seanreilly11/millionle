import { useEffect } from "react";
import { SITE_URL } from "../game.config";

export function TermsScreen() {
  useEffect(() => {
    document.title = "Terms of Service - Millionle";
    const canonical = document.querySelector<HTMLLinkElement>(
      "link[rel='canonical']",
    );
    if (canonical) canonical.href = `${SITE_URL}terms`;
    return () => {
      document.title =
        "Millionle - Guess a Number 1 to 1,000,000 | One Guess Per Day";
      if (canonical) canonical.href = SITE_URL;
    };
  }, []);

  return (
    <div className="max-w-app md:max-w-3xl mx-auto px-6 py-8 pb-16">
      <a
        href="/"
        className="inline-block font-mono text-xs text-steel hover:text-ink tracking-wide mb-8"
      >
        ← Back to game
      </a>

      <h1 className="font-num font-bold text-2xl text-ink mb-1">
        Terms of Service
      </h1>
      <p className="font-mono text-xs text-steel mb-8">
        Effective date: 24 June 2026
      </p>

      <Section id="1" title="Introduction">
        <P>
          These Terms of Service (the "Terms") govern your access to and use of
          Millionle (the "Game"). The Game is operated by Sean Reilly ("we",
          "us", "our"), a sole trader established in the Netherlands. "You" and
          "your" refer to any individual who accesses or plays the Game.
        </P>
        <P>
          By accessing or using the Game, you agree to be bound by these Terms.
          If you do not agree to them, please do not use the Game.
        </P>
        <P>
          These Terms should be read together with our{" "}
          <a href="/privacy" className="text-signal underline">
            Privacy Policy
          </a>
          , which explains how we handle personal data.
        </P>
      </Section>

      <Section id="2" title="Eligibility">
        <P>
          The Game is intended for users aged 16 years or older. By using the
          Game, you confirm that you are at least 16 years old. If you are under
          16, you may not use the Game.
        </P>
      </Section>

      <Section id="3" title="The Game">
        <P>
          The Game is a free, daily number-guessing game. Each day, a hidden
          number is generated, and you may submit one guess. Your result may be
          scored, and you may optionally submit a display name to appear on a
          public leaderboard.
        </P>
        <P>
          We provide the Game free of charge. We may change, suspend, update, or
          discontinue the Game, or any part of it, at any time and without
          notice or liability. We do not guarantee that the Game will always be
          available, uninterrupted, or error-free.
        </P>
      </Section>

      <Section id="4" title="Acceptable use">
        <P>
          When using the Game, you agree that you will <strong>not</strong>:
        </P>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink mb-4">
          {[
            "use any automated means (including bots, scripts, or scrapers) to play the Game, submit guesses, or manipulate scores or the leaderboard;",
            "attempt to gain an unfair advantage, including by reverse-engineering, intercepting, or tampering with the Game's logic, network requests, or stored data to determine or influence the answer;",
            "circumvent, disable, or interfere with any security, rate-limiting, or anti-abuse measures;",
            "submit a display name that is unlawful, offensive, abusive, hateful, harassing, obscene, deceptive, impersonates another person, infringes any third party's rights, or contains personal data of another person;",
            "use the Game in any way that is unlawful, fraudulent, or harmful, or that disrupts or damages the Game or its infrastructure;",
            "attempt to access, interfere with, or disrupt any part of the Game, its servers, or connected services other than as intended through the ordinary user interface.",
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <P>
          We reserve the right to remove any content, restrict or terminate
          access, and reset or remove scores or leaderboard entries, at our
          discretion, where we reasonably believe these Terms have been
          breached.
        </P>
      </Section>

      <Section id="5" title="Leaderboard and user-submitted content">
        <P>
          If you choose to submit a display name, it will be published, together
          with your score, on a <strong>public leaderboard</strong> visible to
          other users. You should not submit any name you would not wish to be
          seen publicly, and you should not use your real name or that of any
          other person.
        </P>
        <P>
          You are solely responsible for the display name you submit and confirm
          that it does not breach Section 4 or infringe the rights of any third
          party.
        </P>
        <P>
          We do not claim ownership of the display name you submit. By
          submitting it, you grant us a non-exclusive, royalty-free, worldwide
          licence to display, store, and reproduce it for the purpose of
          operating the leaderboard and the Game. This licence ends when the
          relevant entry is deleted.
        </P>
        <P>
          We may remove, edit, or refuse to publish any display name at our
          discretion, in particular where it breaches Section 4. You may request
          removal of your name at any time as described in our{" "}
          <a href="/privacy" className="text-signal underline">
            Privacy Policy
          </a>
          .
        </P>
      </Section>

      <Section id="6" title="Intellectual property">
        <P>
          The Game, including its source code, design, graphics, layout, text,
          animations, and the name "Millionle", together with all related
          intellectual property rights, is owned by us or our licensors and is
          protected by copyright and other laws.
        </P>
        <P>
          Except as expressly permitted by these Terms or by applicable law, you
          may not copy, reproduce, modify, distribute, publish, adapt,
          reverse-engineer, or create derivative works from any part of the Game
          without our prior written consent.
        </P>
        <P>
          These Terms do not grant you any right, title, or interest in the Game
          other than the limited, personal, non-exclusive, non-transferable,
          revocable right to access and use it for your own personal,
          non-commercial enjoyment.
        </P>
        <P>
          For the avoidance of doubt, these Terms do not restrict anyone from
          independently creating their own game based on the general idea or
          rules of a daily number-guessing game; the protection above extends
          only to our specific expression of the Game, not to the underlying
          concept.
        </P>
      </Section>

      <Section id="7" title="Disclaimers">
        <P>
          The Game is provided <strong>"as is"</strong> and{" "}
          <strong>"as available"</strong>, without warranties or guarantees of
          any kind, whether express or implied, to the fullest extent permitted
          by applicable law. In particular, we do not warrant that:
        </P>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink mb-4">
          {[
            "the Game will be available, uninterrupted, timely, secure, or error-free;",
            "any defects will be corrected;",
            "the Game, scores, statistics, or leaderboard will be accurate, complete, or reliable; or",
            "the Game will meet your expectations.",
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <P>
          The Game is provided for entertainment purposes only. Scores,
          rankings, streaks, and statistics have no monetary or other value and
          may be reset, lost, or removed at any time.
        </P>
        <P>
          Nothing in these Terms excludes or limits any rights you may have
          under mandatory provisions of applicable consumer law, which are not
          affected by these Terms.
        </P>
      </Section>

      <Section id="8" title="Limitation of liability">
        <P>
          To the fullest extent permitted by applicable law, we will not be
          liable for any indirect, incidental, special, consequential, or
          punitive loss or damage, or for any loss of data, scores, statistics,
          profits, or goodwill, arising out of or in connection with your use
          of, or inability to use, the Game.
        </P>
        <P>
          Because the Game is provided free of charge, our total aggregate
          liability to you arising out of or in connection with the Game or
          these Terms shall in no event exceed <strong>EUR 100</strong> or the
          amount permitted by applicable law, whichever is lower.
        </P>
        <P>
          Nothing in these Terms excludes or limits our liability where it would
          be unlawful to do so, including liability for death or personal injury
          caused by negligence, or for fraud or fraudulent misrepresentation.
        </P>
      </Section>

      <Section id="9" title="Changes to these Terms">
        <P>
          We may update these Terms from time to time. Where we do, we will
          revise the effective date and version above. Material changes will be
          brought to your attention by reasonable means. Your continued use of
          the Game following the posting of updated Terms constitutes your
          acceptance of them.
        </P>
      </Section>

      <Section id="10" title="Governing law and jurisdiction">
        <P>
          These Terms, and any dispute or claim arising out of or in connection
          with them or their subject matter, are governed by and construed in
          accordance with the laws of <strong>the Netherlands</strong>, without
          regard to its conflict-of-laws rules.
        </P>
        <P>
          The competent courts of the Netherlands shall have jurisdiction over
          any such dispute, save that, if you are a consumer, this does not
          deprive you of the protection of any mandatory provisions of the law
          of your country of residence.
        </P>
      </Section>

      <Section id="11" title="General">
        <P>
          If any provision of these Terms is found to be invalid or
          unenforceable, the remaining provisions will continue in full force
          and effect.
        </P>
        <P>
          Our failure to enforce any provision of these Terms shall not
          constitute a waiver of that provision or any other.
        </P>
        <P>
          These Terms, together with the Privacy Policy, constitute the entire
          agreement between you and us concerning the Game.
        </P>
      </Section>

      <Section id="12" title="Contact">
        <P>For any question regarding these Terms, please contact:</P>
        <blockquote className="border-l-2 border-line2 pl-4 my-3 text-sm text-steel leading-relaxed">
          <strong>Sean Reilly</strong>
          <br />
          Email:{" "}
          <a
            href="mailto:hi.millionle@gmail.com"
            className="text-signal underline"
          >
            hi.millionle@gmail.com
          </a>
        </blockquote>
      </Section>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="font-num font-semibold text-base text-ink mb-3">
        {id}. {title}
      </h2>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-ink leading-relaxed mb-3">{children}</p>;
}
