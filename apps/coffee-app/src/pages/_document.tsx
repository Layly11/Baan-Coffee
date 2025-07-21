import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>


        <link
          href='https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500&display=swap'
          rel='stylesheet'
        />
        <link
          rel='stylesheet'
          href='/fontawesome/css/all.min.css'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
