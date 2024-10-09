// _document.js is used to augment your application's <html> and <body> tags
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en">
            <Head />
            <body className="antialiased">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
