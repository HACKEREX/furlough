import { FurloughMaterialThemeModule } from './furlough-material-theme.module';

describe('FurloughMaterialThemeModule', () => {
  let furloughMaterialThemeModule: FurloughMaterialThemeModule;

  beforeEach(() => {
    furloughMaterialThemeModule = new FurloughMaterialThemeModule();
  });

  it('should create an instance', () => {
    expect(furloughMaterialThemeModule).toBeTruthy();
  });
});
