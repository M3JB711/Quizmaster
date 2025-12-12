import JSZip from 'jszip';

export async function extractTextFromPPTX(file: File): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(file);
    
    // Find all slide XML files
    const slideFiles = Object.keys(zip.files).filter(name => 
      name.startsWith("ppt/slides/slide") && name.endsWith(".xml")
    );
    
    // Sort slides numerically to maintain presentation order
    slideFiles.sort((a, b) => {
      const getNum = (name: string) => {
        const match = name.match(/slide(\d+)\.xml/);
        return match ? parseInt(match[1]) : 0;
      };
      return getNum(a) - getNum(b);
    });

    let fullText = "";
    const parser = new DOMParser();

    for (let i = 0; i < slideFiles.length; i++) {
      const fileName = slideFiles[i];
      const content = await zip.files[fileName].async("string");
      const xmlDoc = parser.parseFromString(content, "text/xml");
      
      // Extract text from <a:t> tags (OpenXML format for text)
      const textNodes = xmlDoc.getElementsByTagName("a:t");
      let slideText = "";
      
      for (let j = 0; j < textNodes.length; j++) {
        if (textNodes[j].textContent) {
          slideText += textNodes[j].textContent + " ";
        }
      }

      if (slideText.trim().length > 0) {
        fullText += `[Slide ${i + 1}] ${slideText.trim()}\n`;
      }
    }

    if (fullText.length === 0) {
      throw new Error("No text found in presentation.");
    }

    return fullText;
  } catch (error) {
    console.error("PPTX Parsing Error:", error);
    throw new Error("Failed to extract text from PowerPoint file.");
  }
}