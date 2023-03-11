import fetch from 'node-fetch';
import {v4} from 'uuid';

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

test('GET /content', async () => {
    const userId = v4();
    const item = {
        text: 'Hello World',
        userId: userId,
        date: '2020-01-01T00:00:00.000Z'
    };
    await fetch(url, {
        method: 'POST',
        body: JSON.stringify(item),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const response = await fetch(url + `?start=2020-01-01T00:00:00.000Z&end=2020-01-01T00:00:00.001Z`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'x-helpfl-user-id': userId
        }
    });

    expect(response.status).toEqual(200);
    const data = await response.json();
    expect(data.items).toContain(item);
});

const validDummyBody = {
    text: 'Hello World',
    userId: '4a7ff0c7-fb20-44e5-bba5-f857f270616c',
    date: '2020-01-01T00:00:00.000Z'
};
