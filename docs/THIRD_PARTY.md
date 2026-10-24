# Third-party distribution notices

Run `pnpm notices` after a frozen install. The production build runs it automatically and ships `public/THIRD_PARTY_NOTICES.txt` at `/THIRD_PARTY_NOTICES.txt`.

The generated file contains the installed production dependency graph, installed peers, optional JavaScript dependencies, self-hosted font licence and Next.js vendored notices. It conservatively includes some build/server code that is absent from the browser export. Native build binaries are excluded because the static export does not distribute them. Dependencies retain their own licences; the application MIT licence does not relicense them or the official GRA documents.

`react-remove-scroll-bar@2.3.8` omits a licence file from its npm archive. Its upstream release notice is preserved in `docs/licenses/react-remove-scroll-bar-2.3.8.txt`, as verified in the preceding MoMo Lens audit and retained unchanged here. The generator fails if a dependency has no reviewed notice. Refresh the generated file and source evidence together when changing dependencies.
