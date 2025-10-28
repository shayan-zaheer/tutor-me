function testEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function testPassword(password: string): boolean {
    return password.length >= 6 && password.trim().length > 0 && !password.includes(' ') && password.length <= 25;
}

function testSignUpFields(email: string, password: string, confirmPassword: string): boolean {
    return testEmail(email) && testPassword(password) && password === confirmPassword;
}

function testLoginFields(email: string, password: string): boolean {
    return testEmail(email) && testPassword(password);
}

export { testEmail, testPassword, testSignUpFields, testLoginFields };