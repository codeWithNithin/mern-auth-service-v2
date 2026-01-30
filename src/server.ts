function welcome(name: string) {
    const user = {
        name: 'Nithin',
        age: 20,
    };

    const result = user.name;

    console.log(result);
    return `Welcome ${name}`;
}

welcome('Nithin');
