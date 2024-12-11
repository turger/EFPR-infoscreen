// _app.js is a special file that is used to wrap the entire application. This file is used to persist layout between pages.
import '../app/globals.css';
import {SessionProvider} from 'next-auth/react';

export default function App({Component, pageProps}) {
    return (
        <SessionProvider session={pageProps.session}>
            <Component {...pageProps} />
        </SessionProvider>
    );
}
