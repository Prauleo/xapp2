// controllers/twitter-controller.js
import { 
  generarTweetsAutomaticos, 
  generarVozCuenta, 
  analizarTweet 
} from '../services/openai';
import { 
  saveContent, 
  getContent, 
  getAccounts 
} from '../services/supabase';
import { generarPromptTwitter } from '../../prompt-engineering/twitter-prompts';

/**
 * Crea contenido para Twitter (tweet único o hilo)
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export async function createTwitterContent(req, res) {
  try {
    const { 
      accountId, 
      ideaPrincipal, 
      contextoAdicional, 
      esHilo = false
    } = req.body;

    // Verificar que se proporcionó la idea principal
    if (!ideaPrincipal) {
      return res.status(400).json({ error: 'La idea principal es requerida' });
    }

    // Obtener la cuenta
    const { data: accounts, error: accountError } = await getAccounts(accountId);
    
    if (accountError || !accounts || accounts.length === 0) {
      return res.status(404).json({ error: 'No se pudo encontrar la cuenta' });
    }
    
    const account = accounts[0];
    
    // Verificar que la cuenta sea de tipo Twitter
    if (account.platform !== 'twitter') {
      return res.status(400).json({ error: 'La cuenta debe ser de tipo Twitter' });
    }
    
    // Obtener o generar la voz de la cuenta
    let vozCuenta = account.lexical_profile?.voice_profile;
    
    if (!vozCuenta) {
      vozCuenta = await generarVozCuenta(account);
      
      // Actualizar el perfil léxico de la cuenta con la voz generada
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ 
          lexical_profile: { 
            ...account.lexical_profile || {}, 
            voice_profile: vozCuenta 
          } 
        })
        .eq('id', accountId);
      
      if (updateError) {
        console.error('Error actualizando perfil léxico:', updateError);
      }
    }
    
    // Preparar contexto completo
    const contextoCompleto = {
      ideaPrincipal,
      contextoAdicional,
      esHilo
    };
    
    // Generar contenido usando el template adecuado
    const promptData = {
      vozCuenta,
      ideaPrincipal,
      contextoAdicional: contextoAdicional || '',
      tono: account.tone || 'No especificado'
    };
    
    const { systemPrompt, userPrompt } = generarPromptTwitter(esHilo ? 'hilo' : 'tweet', promptData);
    
    // Generar tweets
    const opcionesTweets = await generarTweetsAutomaticos(
      contextoCompleto, 
      account, 
      vozCuenta
    );
    
    // Guardar el contenido en la base de datos
    const contentData = {
      account_id: accountId,
      platform: 'twitter',
      content_type: esHilo ? 'hilo' : 'tweet',
      main_idea: ideaPrincipal,
      additional_context: contextoAdicional,
      generated_text: JSON.stringify(opcionesTweets),
      edited_text: JSON.stringify(opcionesTweets), // Inicialmente igual al generado
      status: 'draft'
    };
    
    const savedContent = await saveContent(contentData);
    
    res.status(200).json({
      content: savedContent,
      options: opcionesTweets
    });
  } catch (error) {
    console.error('Error creating Twitter content:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Obtiene el contenido de Twitter para una cuenta específica
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export async function getTwitterContent(req, res) {
  try {
    const { accountId } = req.params;
    
    // Obtener el contenido
    const content = await getContent(accountId);
    
    // Filtrar solo el contenido de Twitter
    const twitterContent = content.filter(item => item.platform === 'twitter');
    
    res.status(200).json(twitterContent);
  } catch (error) {
    console.error('Error getting Twitter content:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Analiza un tweet para proporcionar sugerencias de mejora
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export async function analyzeTwitterContent(req, res) {
  try {
    const { tweetText, accountId } = req.body;
    
    if (!tweetText) {
      return res.status(400).json({ error: 'El texto del tweet es requerido' });
    }
    
    // Obtener la cuenta
    const { data: accounts, error: accountError } = await getAccounts(accountId);
    
    if (accountError || !accounts || accounts.length === 0) {
      return res.status(404).json({ error: 'No se pudo encontrar la cuenta' });
    }
    
    const account = accounts[0];
    
    // Analizar el tweet
    const analysis = await analizarTweet(tweetText, account);
    
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error analyzing Twitter content:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Actualiza el contenido de un tweet
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
export async function updateTwitterContent(req, res) {
  try {
    const { contentId } = req.params;
    const { editedText, status } = req.body;
    
    // Actualizar el contenido
    const { data, error } = await supabase
      .from('content')
      .update({ 
        edited_text: editedText,
        status: status || 'draft',
        updated_at: new Date()
      })
      .eq('id', contentId)
      .select();
    
    if (error) {
      throw new Error('No se pudo actualizar el contenido');
    }
    
    res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error updating Twitter content:', error);
    res.status(500).json({ error: error.message });
  }
}

export default {
  createTwitterContent,
  getTwitterContent,
  analyzeTwitterContent,
  updateTwitterContent
};
