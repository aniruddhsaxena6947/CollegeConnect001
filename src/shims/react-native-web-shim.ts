export * from 'react-native-web';

export const TurboModuleRegistry = {
  get: () => null,
  getEnforcing: () => ({}),
};

export const codegenNativeComponent = (name: string) => name as any;

export const codegenNativeCommands = () => ({});

export const requireNativeComponent = (name: string) => name as any;
