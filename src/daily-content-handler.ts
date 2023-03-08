export class NightlyPublishHandler {

  invoke: () => Promise<void> = async () => {
    console.log('Hello World');
  }
}

export const handler = new NightlyPublishHandler().invoke;
