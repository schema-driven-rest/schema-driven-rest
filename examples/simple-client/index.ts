import {UserClient} from './api/api';

async function main() {
  const userClient = new UserClient({baseUrl: 'http://localhost:3000'});

  const result = await userClient.login({username: 'hi'});
  console.log(result.authorized);
}

main().catch(e => console.error(e));
