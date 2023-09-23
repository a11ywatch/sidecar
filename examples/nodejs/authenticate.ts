// authentication example vianodejs
import { appReady } from "@a11ywatch/a11ywatch";

// wait till app is ready to auth
appReady()
  .then(async () => {
    const { UsersController } = await import(
      "@a11ywatch/core/core/controllers"
    );

    const email = "myemail@gmail.com"; // test auth email
    const password = "mypass"; // test auth password

    // create a new user
    const data = await UsersController().createUser({
      email,
      password,
    });

    console.log(data);
  })
  .catch((e) => {
    console.error(e);
  });
