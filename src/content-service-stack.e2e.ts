import fetch from 'node-fetch';

const url = `https://${process.env.STAGE}.api.helpfl.click/content`;

test('POST /content', async () => {
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(validDummyBody),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    expect(response.status).toEqual(201);
    const data = await response.json();
    expect(data).toEqual({message: 'Created'});
});

const validDummyBody = {
    text: 'Hello World',
    userId: '4a7ff0c7-fb20-44e5-bba5-f857f270616c',
    date: '2020-01-01T00:00:00.000Z'
};
