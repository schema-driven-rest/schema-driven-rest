## Before Release

- [ ] add init for plugin, example serverless needs apibase.ts, fetch needs baseapi.ts
- [ ] show support for methods in a plugin
- [ ] "you can even have multiple plugins run in the same file"
- [ ] document handlerWrapper parameter
- [ ] for servless plugin you need to describe how to update your yaml. do it from scratch once, youll see
- [ ] fix fucking tsconfig module
- [ ] add example pages
- [ ] document no support for custom scalars
- [ ] add how to create your own plugin
- [ ] add express example
- [ ] update homepage details
- [x] fix fetch
- [x] add axios
- [x] update plugin text to look like this: https://graphql-code-generator.com/docs/plugins/typescript-vue-apollo
- [x] add details about hwo this was inspired by  
- [x] https://v2.docusaurus.io/docs/using-plugins do this for npm yarn install
- [x] add cli command pregen graphql 
- [x] add responsive support to codegen component
- [x] add cli command init to create sdr.yaml
- [x] rename to sdr
- [x] test deploy
- [x] deploy plugins
- [x] get logo
- [x] stress that there is no runtime, this is just a generator 
- [x] add basic readme's
- [x] figure out yarn link for dev 
- [x] add plugin template
- [x] fix validation models
- [x] add union support for validation
- [x] add support for implements type in validate
- [x] add watch
- [x] make yargs work withou --
- [x] watch should run once
- [x] add help to cli
- [x] add webpack to cli
- [x] fix serverless
- [x] build script to deploy to npm
- [x] change to lerna mono repo
- [x] recursive create folder support
- [x] add support for required parameters in plugin
- [x] init should update your package json
- [x] add support for local plugins



## Later

- [ ] figure out how to not make sdr global, installed locally, npx?
- [ ] figure out why 2FA didnt rename correctly in models
- [ ] remove scalar from models 
- [ ] add command to serve your graphql so your client can read it???
- [ ] when you run wiht no types it bunkos, add more logging "13 types processed"

