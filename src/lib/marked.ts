import { marked } from 'marked';
const renderer = new marked.Renderer();

renderer.image = ({ text }) => text;
marked.use({
    tokenizer: {
        code() {
            return undefined; 
        },
        fences() {
            return undefined;
        }
    }
});

export const setRender = renderer;
export const setMarked = marked;