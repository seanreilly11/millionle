import { useEffect } from "react";
import { SITE_URL } from "../game.config";

export function PrivacyScreen() {
  useEffect(() => {
    document.title = "Privacy Policy - Millionle";
    const canonical = document.querySelector<HTMLLinkElement>(
      "link[rel='canonical']",
    );
    if (canonical) canonical.href = `${SITE_URL}privacy`;
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
        Privacy Policy
      </h1>
      <p className="font-mono text-xs text-steel mb-8">
        Effective date: 24 June 2026
      </p>

      <Section id="1" title="Introduction">
        <P>
          This Privacy Policy explains how personal data is collected, used,
          stored, and disclosed when you access or play Millionle (the "Game"),
          and describes your rights in relation to that data.
        </P>
        <P>
          In this Policy, "we", "us" and "our" refer to Dovedale Development,
          the operator of the Game and the data controller responsible for your
          personal data. "You" and "your" refer to any individual who accesses
          or plays the Game.
        </P>
        <P>
          The Game is available to users worldwide. We are established in the
          Netherlands and process all personal data in accordance with
          Regulation (EU) 2016/679 (the "GDPR") and the Dutch implementing
          legislation (<em>Uitvoeringswet AVG</em>). We apply these standards to
          all users, wherever they are located.
        </P>
        <P>
          Please read this Policy carefully. By using the Game, you acknowledge
          that you have read and understood it.
        </P>
      </Section>

      <Section id="2" title="Data controller">
        <P>
          The data controller responsible for the personal data described in
          this Policy is:
        </P>
        <Contact>
          <strong>Dovedale Development</strong> (eenmanszaak, sole trader
          registered in the Netherlands)
          <br />
          Email:{" "}
          <a
            href="mailto:dovedaledev@gmail.com"
            className="text-signal underline"
          >
            dovedaledev@gmail.com
          </a>
        </Contact>
        <P>
          We have not appointed a Data Protection Officer, as we are not
          required to do so under Article 37 of the GDPR. For any question
          concerning this Policy or your personal data, please contact us at the
          email address above.
        </P>
      </Section>

      <Section id="3" title="Age requirement">
        <P>
          The Game is intended for users aged 16 years or older, consistent with
          the age of digital consent in the Netherlands under Article 8 of the
          GDPR. By accessing the Game you confirm that you are at least 16 years
          old.
        </P>
        <P>
          We do not knowingly collect personal data from children under the age
          of 16. If you are under 16, please do not use the Game or provide any
          personal data. If we become aware that we have collected personal data
          from a person under 16 without appropriate consent, we will delete
          that data without undue delay. If you believe a child under 16 has
          provided us with personal data, please contact us at{" "}
          <a
            href="mailto:dovedaledev@gmail.com"
            className="text-signal underline"
          >
            dovedaledev@gmail.com
          </a>
          .
        </P>
      </Section>

      <Section id="4" title="Data stored locally on your device">
        <P>
          The Game stores the following two items in your browser's local
          storage. This data remains on your device and is not transmitted to us
          or any third party except where expressly described in Section 5.
        </P>
        <Table
          headers={["Item", "Key", "Description"]}
          rows={[
            [
              "Random identifier",
              "millionle.uuid",
              "A randomly generated value created on first use to distinguish your gameplay. It is not derived from, and cannot be linked to, your real-world identity by us. It persists until you clear your browser's storage.",
            ],
            [
              "Display name",
              "millionle.name",
              "The pseudonym you choose if you submit a score to the leaderboard. It is stored locally so that it can be pre-filled on subsequent visits.",
            ],
          ]}
        />
        <P>
          This local storage is <strong>strictly necessary</strong> for the
          functioning of the Game. As such, under the ePrivacy Directive
          2002/58/EC and Article 11.7a of the Dutch Telecommunications Act (
          <em>Telecommunicatiewet</em>), it is exempt from the requirement to
          obtain prior consent.{" "}
          <strong>
            We do not set any cookies and do not use any cross-site tracking
            technologies.
          </strong>
        </P>
      </Section>

      <Section id="5" title="Personal data we collect and process">
        <P>
          When you interact with the Game, the following data is transmitted to
          and stored on our servers. Because all of this data is associated with
          your persistent random identifier, we treat it as personal data even
          though it does not identify you by name.
        </P>

        <H3>5.1 Data sent with every request</H3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-ink mb-4">
          <li>
            Your <strong>random identifier</strong> (
            <code className="font-mono text-xs bg-card2 px-1 rounded">
              millionle.uuid
            </code>
            ).
          </li>
          <li>
            Your <strong>UTC time-zone offset</strong> (a numeric value such as
            +60 or −300). This is used solely to determine which day's puzzle
            applies to you. It is not your precise location and does not
            identify your city, address, or GPS position.
          </li>
        </ul>

        <H3>5.2 Data sent by specific actions</H3>
        <Table
          headers={["Action", "Additional data transmitted and stored"]}
          rows={[
            ["Submitting a guess", "Your guess (a number)"],
            ["Joining the leaderboard", "Your chosen display name"],
            ["Viewing the leaderboard", "The relevant puzzle date"],
            ["Retrieving your result", "-"],
            [
              "Gameplay events",
              "Event name, user-agent string, mobile/desktop indicator, platform, browser language, and network connection type",
            ],
          ]}
        />

        <H3>5.3 IP addresses</H3>
        <P>
          We do <strong>not</strong> store IP addresses. However, as an
          unavoidable feature of internet communications, your IP address is
          transiently processed by our hosting and database providers (see
          Section 7) in order to route and deliver your requests. We do not
          record it in our database or use it to identify you.
        </P>

        <H3>5.4 Data we do not collect</H3>
        <P>
          For the avoidance of doubt, we do <strong>not</strong> collect or
          process any of the following:
        </P>
        <ul className="list-disc pl-5 space-y-1 text-sm text-ink mb-4">
          {[
            "Email address",
            "Real name (the display name is a pseudonym chosen by you)",
            "Password or login credentials",
            "Payment or financial information",
            "Precise or geolocation data (we receive a time-zone offset only)",
            "Stored IP addresses",
            "Data obtained through cookies (we set none)",
            "Data obtained through advertising pixels or cross-site trackers",
            "Special categories of personal data within the meaning of Article 9 of the GDPR",
          ].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <P>
          We do not sell your personal data, and we do not share it with
          advertisers.
        </P>
      </Section>

      <Section id="6" title="Purposes of processing and legal bases">
        <P>
          We process your personal data only where we have a lawful basis to do
          so under Article 6 of the GDPR.
        </P>
        <Table
          headers={["Data", "Purpose", "Legal basis (Art. 6 GDPR)"]}
          rows={[
            [
              "Random identifier and gameplay data (guess, score, streak, time-zone offset)",
              "To operate the Game, deliver the correct daily puzzle, enforce one guess per day, and calculate your statistics",
              "Legitimate interests (Art. 6(1)(f)) - necessary to provide the core service you have requested",
            ],
            [
              "Display name",
              "To publish your name alongside your score on the public leaderboard",
              "Consent (Art. 6(1)(a)) - you actively choose to enter and submit a name",
            ],
            [
              "Event and device data (user-agent, platform, language, network type)",
              "To understand how the Game is used and to maintain and improve it",
              "Legitimate interests (Art. 6(1)(f)) - analysing usage to operate and improve the service",
            ],
          ]}
        />
        <P>
          Where we rely on legitimate interests, we have considered and balanced
          those interests against your rights, freedoms, and reasonable
          expectations. Where we rely on consent (for your display name), you
          may withdraw that consent at any time by contacting us to have your
          name removed from the leaderboard.
        </P>
      </Section>

      <Section id="7" title="Recipients and sub-processors">
        <P>
          We use the following third-party service providers, who process
          personal data on our behalf or in connection with the Game.
        </P>
        <div className="space-y-3 mb-4">
          <SubProcessor name="Vercel Inc." role="Hosting">
            All requests to the Game are served through Vercel's infrastructure,
            which transiently processes IP addresses and maintains standard
            server logs. Vercel's processing is governed by its Data Processing
            Addendum and Privacy Policy at vercel.com/legal.
          </SubProcessor>
          <SubProcessor name="Vercel Analytics" role="Aggregate analytics">
            Provides cookieless, aggregated traffic statistics, including page
            URL, referrer, approximate device type, and country derived from IP
            address. No persistent identifier is created or stored on your
            device by this service.
          </SubProcessor>
          <SubProcessor name="Supabase, Inc." role="Database">
            Stores the gameplay records described in Section 5. Our Supabase
            database is hosted in a <strong>Central EU region</strong>, and this
            data is therefore stored within the European Union.
          </SubProcessor>
        </div>
        <P>
          We do not otherwise disclose your personal data to third parties,
          except where required to do so by law or by a competent authority.
        </P>
      </Section>

      <Section id="8" title="International transfers">
        <P>
          The gameplay data we store is held in a database located in the
          European Union (see Section 7) and is not transferred outside the
          European Economic Area (the "EEA").
        </P>
        <P>
          However, some service providers in the request-delivery path are
          established in the United States, and limited data (such as the
          transient processing of IP addresses by our host) may be processed
          outside the EEA. Where this occurs, it is protected by appropriate
          safeguards under Chapter V of the GDPR: Vercel Inc. is certified under
          the EU–U.S. Data Privacy Framework and additionally relies on the
          European Commission's Standard Contractual Clauses (Implementing
          Decision (EU) 2021/914).
        </P>
        <P>
          You may obtain further information about these safeguards by
          contacting us at{" "}
          <a
            href="mailto:dovedaledev@gmail.com"
            className="text-signal underline"
          >
            dovedaledev@gmail.com
          </a>
          .
        </P>
      </Section>

      <Section id="9" title="Data retention">
        <P>
          We retain the gameplay records stored in our database - including your
          random identifier, guesses, scores, display name, time-zone offset,
          and event/device data - for an indefinite period, in order to maintain
          the integrity and history of the Game and its leaderboards.
        </P>
        <P>
          You may request erasure of your data at any time, as described in
          Section 10, and we will act on any such request in accordance with our
          obligations under the GDPR.
        </P>
        <P>
          Data stored locally on your device (your random identifier and display
          name) is retained until you clear your browser's local storage or
          request its deletion.
        </P>
      </Section>

      <Section id="10" title="Your rights">
        <P>
          Subject to the conditions and exceptions set out in the GDPR, you have
          the following rights in relation to your personal data:
        </P>
        <ul className="list-disc pl-5 space-y-1 text-sm text-ink mb-4">
          <li>
            <strong>Right of access</strong> (Art. 15) - to obtain confirmation
            of whether we process your data and a copy of that data
          </li>
          <li>
            <strong>Right to rectification</strong> (Art. 16) - to have
            inaccurate data corrected, including your leaderboard display name
          </li>
          <li>
            <strong>Right to erasure</strong> (Art. 17) - to have your data
            deleted
          </li>
          <li>
            <strong>Right to restriction of processing</strong> (Art. 18) - to
            limit how we process your data in certain circumstances
          </li>
          <li>
            <strong>Right to data portability</strong> (Art. 20) - to receive
            data you have provided to us, where processing is based on consent
            or contract
          </li>
          <li>
            <strong>Right to object</strong> (Art. 21) - to object to processing
            carried out on the basis of our legitimate interests
          </li>
          <li>
            <strong>Right to withdraw consent</strong> (Art. 7(3)) - to withdraw
            consent at any time where processing is based on it
          </li>
        </ul>

        <H3>How to exercise your rights</H3>
        <P>
          Because the Game uses no accounts and we hold no contact details for
          you, exercise your rights as follows:
        </P>
        <ol className="list-decimal pl-5 space-y-1 text-sm text-ink mb-4">
          <li>
            Locate your random identifier in your browser's local storage under
            the key{" "}
            <code className="font-mono text-xs bg-card2 px-1 rounded">
              millionle.uuid
            </code>
            .
          </li>
          <li>
            Email it to us at{" "}
            <a
              href="mailto:dovedaledev@gmail.com"
              className="text-signal underline"
            >
              dovedaledev@gmail.com
            </a>
            , stating which right you wish to exercise.
          </li>
        </ol>
        <P>
          We aim to respond to all requests within one month of receipt, as
          required by Article 12(3) of the GDPR.
        </P>

        <H3>Right to lodge a complaint</H3>
        <P>
          If you believe that our processing of your personal data infringes the
          GDPR, you have the right to lodge a complaint with a supervisory
          authority. Our lead supervisory authority is:
        </P>
        <Contact>
          <strong>Autoriteit Persoonsgegevens</strong>
          <br />
          <a
            href="https://autoriteitpersoonsgegevens.nl"
            className="text-signal underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            autoriteitpersoonsgegevens.nl
          </a>
        </Contact>
        <P>
          You may also lodge a complaint with the supervisory authority in your
          country of residence.
        </P>
      </Section>

      <Section id="11" title="Automated decision-making">
        <P>
          We do not carry out any automated decision-making, including
          profiling, that produces legal effects concerning you or that
          similarly significantly affects you within the meaning of Article 22
          of the GDPR. Scores and rankings are calculated arithmetically from
          your guess and do not constitute such decision-making.
        </P>
      </Section>

      <Section id="12" title="Security">
        <P>
          We implement appropriate technical and organisational measures to
          protect your personal data against accidental or unlawful destruction,
          loss, alteration, unauthorised disclosure, or access, as required by
          Article 32 of the GDPR. These measures include the encryption of data
          in transit (HTTPS/TLS), restricting access to gameplay records, and
          engaging service providers that maintain recognised security standards
          and store data within the European Union.
        </P>
        <P>
          No method of transmission or storage is entirely secure, and we cannot
          guarantee absolute security. In the event of a personal data breach
          likely to result in a risk to your rights and freedoms, we will notify
          the competent supervisory authority and, where required, affected
          individuals, in accordance with Articles 33 and 34 of the GDPR.
        </P>
      </Section>

      <Section id="13" title="Changes to this Policy">
        <P>
          We may update this Policy from time to time. Where we do, we will
          revise the effective date at the top of this document. Material
          changes will be brought to your attention by reasonable means. Your
          continued use of the Game following the posting of an updated Policy
          constitutes acknowledgement of the revised terms.
        </P>
      </Section>

      <Section id="14" title="Contact">
        <P>
          For any question, request, or concern regarding this Policy or your
          personal data, please contact:
        </P>
        <Contact>
          <strong>Dovedale Development</strong>
          <br />
          Email:{" "}
          <a
            href="mailto:dovedaledev@gmail.com"
            className="text-signal underline"
          >
            dovedaledev@gmail.com
          </a>
        </Contact>
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

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-num font-semibold text-sm text-ink mt-4 mb-2">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-ink leading-relaxed mb-3">{children}</p>;
}

function Contact({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-2 border-line2 pl-4 my-3 text-sm text-steel leading-relaxed">
      {children}
    </blockquote>
  );
}

function SubProcessor({
  name,
  role,
  children,
}: {
  name: string;
  role: string;
  children: React.ReactNode;
}) {
  return (
    <div className="text-sm text-ink leading-relaxed">
      <span className="font-semibold">{name}</span>{" "}
      <span className="text-steel">- {role}.</span> {children}
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto mb-4 -mx-1">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="text-left font-mono font-normal text-steel py-2 px-2 border-b border-line2 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-card2" : ""}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="text-ink py-2 px-2 align-top border-b border-line text-xs leading-relaxed"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
