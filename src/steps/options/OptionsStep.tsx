import React, { Component, ComponentProps } from 'react';
import OptionComponent from './Option';
import OptionElement from './OptionElement';
import OptionText from './OptionText';
import Options from './Options';
import { Option } from '../../schemas/schema';

interface Props {
  step: {};
  triggerNextStep: Function;
  optionStyle: ComponentProps<typeof OptionComponent>['style'];
  optionElementStyle: ComponentProps<typeof OptionElement>['style'];
}

export class OptionsStep extends Component<Props> {
  private onOptionClick = ({ value }: { value: number }) => {
    this.props.triggerNextStep({ value });
  };

  private renderOption = (option: Option) => {
    const { optionStyle, optionElementStyle } = this.props;
    const { optionBubbleColor, optionFontColor, bubbleColor, fontColor } = this
      .props.step as any;
    const { value, label } = option;
    return (
      <OptionComponent
        key={value}
        style={optionStyle}
        onPress={() => this.onOptionClick({ value })}
      >
        <OptionElement
          style={optionElementStyle}
          bubbleColor={optionBubbleColor || bubbleColor}
        >
          <OptionText fontColor={optionFontColor || fontColor}>
            {label}
          </OptionText>
        </OptionElement>
      </OptionComponent>
    );
  };

  render() {
    const { options } = this.props.step as any;

    return <Options>{options.map(this.renderOption)}</Options>;
  }
}

export default OptionsStep;
