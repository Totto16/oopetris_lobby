export const constants = {
    username: {
        min: 4,
        max: 20,
    },

    password: {
        min: 8,
        max: 30,
        // regex taken from :https://stackoverflow.com/questions/60451337/password-confirmation-in-typescript-with-class-validator
        regex: /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    },
};
