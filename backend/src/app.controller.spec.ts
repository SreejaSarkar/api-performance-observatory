import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let appService: jest.Mocked<AppService>;

  beforeEach(() => {
    appService = {
      getHello: jest.fn().mockReturnValue('Hello World!'),
    } as unknown as jest.Mocked<AppService>;

    controller = new AppController(appService);
  });

  it('returns the greeting from the app service', () => {
    expect(controller.getHello()).toBe('Hello World!');
    expect(appService.getHello.mock.calls).toEqual([[]]);
  });
});

