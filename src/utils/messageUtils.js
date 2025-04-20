export function decodeHtmlEntities(text) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
}

export function cleanMessage(m) {
    m = decodeHtmlEntities(m);
    
    // Create a DOM element to manipulate the HTML
    const div = document.createElement('div');
    div.innerHTML = m;
    
    // Remove <br> tags that aren't followed by content
    const brTags = div.querySelectorAll('br');
    brTags.forEach(br => {
        const next = br.nextElementSibling || br.nextSibling;
        if (!next || (next.tagName === 'BR' || next.textContent.trim() === '')) {
            br.parentNode.removeChild(br);
        }
    });
    
    // Remove trailing empty tags
    Array.from(div.children).forEach(child => {
        if (child.textContent.trim() === '' && 
            child.querySelectorAll('img, iframe').length === 0) {
            child.parentNode.removeChild(child);
        }
    });
    
    // Ensure the last <p> tag has margin-bottom: 0
    const lastP = div.querySelector('p:last-of-type');
    if (lastP) {
        lastP.style.marginBottom = '0';
    }
    
    return div.innerHTML;
}

export function truncateHTML(html, maxLength) {
    let tempDiv = document.createElement("div");
    // Decode HTML entities (e.g., &lt;br&gt; -> <br>)
    let textArea = document.createElement("textarea");
    textArea.innerHTML = html;
    let decodedHtml = textArea.value;

    tempDiv.innerHTML = decodedHtml;

    // Function to safely extract the visible text and respect HTML tags
    let visibleText = tempDiv.textContent || tempDiv.innerText;

    // If the visible text is already smaller than maxLength, no need to truncate
    if (visibleText.length <= maxLength) {
        return decodedHtml;
    }

    let truncatedText = '';
    let totalLength = 0;
    let nodes = tempDiv.childNodes;

    // Traverse through all child nodes
    for (let node of nodes) {
        if (totalLength >= maxLength) break;

        // If the node is a text node, count its length
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.textContent;
            let remaining = maxLength - totalLength;

            if (text.length > remaining) {
                truncatedText += text.substring(0, remaining);
                totalLength = maxLength;
            } else {
                truncatedText += text;
                totalLength += text.length;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // For elements, add the tag, but check if we will exceed the maxLength
            let elementHtml = node.outerHTML;

            let remaining = maxLength - totalLength;
            if (elementHtml.length > remaining) {
                truncatedText += elementHtml.substring(0, remaining);
                totalLength = maxLength;
                break;
            } else {
                truncatedText += elementHtml;
                totalLength += elementHtml.length;
            }

            // Check if we encounter a <br> tag and stop truncating at 40 characters
            if (node.nodeName.toLowerCase() === 'br') {
                truncatedText += node.outerHTML;
                totalLength = maxLength;
                break;
            }
        }
    }

    // If we exceed the maxLength, add ellipsis
    if (totalLength > maxLength) {
        truncatedText = truncatedText.substring(0, maxLength) + "...";
    }

    // Remove <br> tags after truncation
    truncatedText = truncatedText.replace(/<br\s*\/?>/gi, "");
    
    return truncatedText;
}