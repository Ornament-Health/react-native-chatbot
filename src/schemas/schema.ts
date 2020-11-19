import userSchema from './userSchema';
import textSchema from './textSchema';
import optionsSchema from './optionsSchema';
import customSchema from './customSchema';
import updateSchema from './updateSchema';

const schema = {
  parse(step: Step) {
    let parser = [];

    if (step.user) {
      parser = userSchema;
    } else if (step.message) {
      parser = textSchema;
    } else if (step.options) {
      parser = optionsSchema;
    } else if (step.component) {
      parser = customSchema;
    } else if (step.update) {
      parser = updateSchema;
    } else {
      throw new Error(`The step ${JSON.stringify(step)} is invalid`);
    }

    for (let i = 0, len = parser.length; i < len; i += 1) {
      const { key, types, required } = parser[i];

      if (!step[key as StepKeys] && required) {
        throw new Error(
          `Key '${key}' is required in step ${JSON.stringify(step)}`
        );
      } else if (step[key as StepKeys]) {
        if (
          types[0] !== 'any' &&
          types.indexOf(typeof step[key as StepKeys]) < 0
        ) {
          throw new Error(
            `The type of '${key}' value must be ${types.join(
              ' or '
            )} instead of ${typeof step[key as StepKeys]}`
          );
        }
      }
    }

    const keys = parser.map(p => p.key);

    for (const key in step) {
      if (keys.indexOf(key) < 0) {
        console.warn(`Invalid key '${key}' in step '${step.id}'`);
        delete step[key as StepKeys];
      }
    }

    return step;
  },

  checkInvalidIds(steps: StepsDictionary) {
    for (const key in steps) {
      const step = steps[key];
      const triggerId = steps[key].trigger;

      if (typeof triggerId !== 'function') {
        if (step.options) {
          const triggers = step.options.filter(
            option => typeof option.trigger !== 'function'
          );
          const optionsTriggerIds = triggers.map(option => option.trigger);

          for (let i = 0, len = optionsTriggerIds.length; i < len; i += 1) {
            const optionTriggerId = optionsTriggerIds[i];
            if (optionTriggerId && !steps[optionTriggerId as string]) {
              throw new Error(
                `The id '${optionTriggerId}' triggered by option ${
                  i + 1
                } in step '${steps[key].id}' does not exist`
              );
            }
          }
        } else if (triggerId && !steps[triggerId]) {
          throw new Error(
            `The id '${triggerId}' triggered by step '${steps[key].id}' does not exist`
          );
        }
      }
    }
  },
};

export default schema;

// typings

export type ID = string | number;
interface MessageProps {
  previousValue?: string | number;
  steps?: StepsDictionaryPartial;
}
export type Message = ({ previousValue, steps }?: MessageProps) => string;

interface TriggerProps {
  value?: string | number;
  steps: StepsDictionaryPartial;
}
export type Trigger = ({ value, steps }: TriggerProps) => ID;

export type Validator = (value: string) => boolean;

export interface Option {
  value: number;
  label: string;
  trigger: ID | Trigger;
}

interface CustomComponentProps {
  step: any;
  steps: any;
  previousStep: any;
  triggerNextStep: any;
}

// STEPS
interface CommonStep {
  id: ID;
  end?: boolean;
  inputAttributes?: {};
  metadata?: {};
  trigger?: ID | Trigger;
}

interface TextStep extends CommonStep {
  message: string | Message;
  avatar?: string;
  delay?: number;
}

interface UserStep extends CommonStep {
  user: boolean;
  validator?: Validator;
}

interface OptionsStep extends Omit<CommonStep, 'trigger'> {
  options: Option[];
}

interface CustomStep extends CommonStep {
  component: React.Component<CustomComponentProps> | JSX.Element;
  replace?: boolean;
  waitAction?: boolean;
  asMessage?: boolean;
  delay?: number;
}

interface UpdateStep extends Omit<CommonStep, 'end'> {
  update: ID;
}

export type RunTimeStep = Step & {
  key?: string;
  value?: string | number;
  option?: Option;
};

export type StepsDictionary = { [id: string]: RunTimeStep };

export type StepsDictionaryPartial = { [id: string]: Partial<RunTimeStep> };

export type StepUnion =
  | TextStep
  | UserStep
  | OptionsStep
  | CustomStep
  | UpdateStep;

export type Step = TextStep & UserStep & OptionsStep & CustomStep & UpdateStep;

export type StepKeys = keyof Step;
