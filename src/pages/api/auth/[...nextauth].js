import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: {
                    label: 'Username',
                    type: 'text',
                    placeholder: 'Enter username',
                },
                password: {label: 'Password', type: 'password'},
            },
            authorize(credentials) {
                const isAuthorized =
                    credentials.username === process.env.AUTH_USER &&
                    credentials.password === process.env.AUTH_PASSWORD;

                if (isAuthorized) {
                    return {id: 1, name: 'Authorized User'};
                } else {
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({session, token}) {
            session.user = token.user;
            return session;
        },
        async jwt({token, user}) {
            if (user) {
                token.user = user;
            }
            return token;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});
