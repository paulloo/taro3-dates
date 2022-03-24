/**
 * 计算尺寸
 * @param el 元素
 * @param axis 轴向
 * @param borderBox 
 * @param withMargin 
 */
export default function calculateDimension(el, axis, borderBox = false, withMargin = false) {
    if (!el) {
      return 0;
    }
  
    const axisStart = axis === 'width' ? 'Left' : 'Top';
    const axisEnd = axis === 'width' ? 'Right' : 'Bottom';
  
    // Only read styles if we need to
    const style = (!borderBox || withMargin) ? window.getComputedStyle(el) : null;
  
    // Offset includes border and padding
    const { offsetWidth, offsetHeight } = el;
    let size = axis === 'width' ? offsetWidth : offsetHeight;
  
    // Get the inner size
    if (!borderBox) {
      size -= (
        parseFloat(style && style[`padding${axisStart}`])
        + parseFloat(style && style[`padding${axisEnd}`])
        + parseFloat(style && style[`border${axisStart}Width`])
        + parseFloat(style && style[`border${axisEnd}Width`])
      );
    }
  
    // Apply margin
    if (withMargin) {
      size += (parseFloat(style && style[`margin${axisStart}`]) + parseFloat(style && style[`margin${axisEnd}`]));
    }
  
    return size;
  }
  