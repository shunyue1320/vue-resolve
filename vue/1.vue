<template>
  <div>
    <div class="question-statement">
      <div class="border border-primary rounded text-primary d-table p-1 small shadowmeld">
        {{ question.id }}
      </div>
      <span v-if="!question.hide_no && questionNo" class="mr-2">{{ questionNo }}. </span>
      <div>
        <BlockList :formatted-content="question.formatted_content" :testing="testing" :user-inputs="userInputs" />
      </div>
    </div>
    <div v-if="question.max_attachments_count > 0">
      <QuestionAttachment :question="question" :testing="testing" @attachmentChange="attachmentChange"/>
    </div>
    <ul class="question-options">
      <li v-for="option in question.options" :key="option.id" class="question-option">
        <label v-if="testing" class="mb-0">
          <input type="radio" :name="question.inputs[0].input_name" :value="option.value" class="hidden" @input="onInput($event.target.value)">
          <span class="question-form-radio mr-1">
            {{ option.value }}
          </span>
          <BlockElement
            :element="{ children: option.formatted_content, node: 'div' }"
            :testing="testing"
            :user-inputs="userInputs"
            class="d-inline-block mb-0" />
        </label>
        <label v-else class="mb-0">
          <span :class="'question-form-radio mr-1 question-text-' + fetchStatus(option.value)">
            {{ option.value }}
          </span>
          <BlockElement
            :element="{ children: option.formatted_content, node: 'div' }"
            :testing="testing"
            :user-inputs="userInputs"
            :class="'d-inline mb-0 paper-text-' + fetchStatus(option.value)" />
        </label>
      </li>
    </ul>
  </div>
</template>

<script>
import QuestionAttachment from './QuestionAttachment'
import BlockElement from '../basic/BlockElement'
import BlockList from '../basic/BlockList'

export default {
  components: { QuestionAttachment, BlockElement, BlockList },
  props: {
    question: { type: Object, required: true },
    questionNo: { type: String, required: false },
    userInputs: { type: Array, default: () => ([]) },
    testing: { type: Boolean, required: false }
  },
  data() {
    return {
      userInput: { id: this.question.inputs[0].id }
    }
  },
  methods: {
    onInput(value) {
      this.userInput.value = value
      this.$emit('input', this.userInput)
    },
    attachmentChange(files) {
      this.userInput.files = files
      this.$emit('input', this.userInput)
    },
    fetchStatus(optionValue) {
      if (!this.userInputs[0]) {
        return ''
      }

      if (this.userInputs[0].answer == optionValue) {
        return this.userInputs[0].status
      } else {
        return ''
      }
    }
  }
}
</script>
