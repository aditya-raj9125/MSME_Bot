import OpenAI from 'openai';

/**
 * Agent Orchestrator - Analyzes user input and routes to specialized agents
 * Implements agentic AI framework for intelligent, context-aware responses
 */
export class AgentOrchestrator {
  constructor(ruleEngine, complianceService) {
    this.ruleEngine = ruleEngine;
    this.complianceService = complianceService;
    
    // Initialize Grok LLM
    const useGrok = process.env.USE_GROK === 'true';
    const apiKey = useGrok ? process.env.GROK_API_KEY : process.env.OPENAI_API_KEY;
    
    if (apiKey) {
      this.llm = new OpenAI({
        apiKey: apiKey,
        baseURL: useGrok ? (process.env.GROK_API_URL || 'https://api.x.ai/v1') : 'https://api.openai.com/v1'
      });
      this.model = process.env.LLM_MODEL || 'grok-2-latest';
      console.log(`🤖 AgentOrchestrator: Using ${useGrok ? 'Grok' : 'OpenAI'} LLM`);
    } else {
      this.llm = null;
      console.log('⚠️ AgentOrchestrator: No LLM available');
    }

    // Initialize specialized agents
    this.agents = {
      intentAnalyzer: this.createIntentAnalyzer(),
      discoveryAgent: this.createDiscoveryAgent(),
      complianceAgent: this.createComplianceAgent(),
      timelineAgent: this.createTimelineAgent(),
      platformAgent: this.createPlatformAgent(),
      readinessAgent: this.createReadinessAgent(),
      generalAgent: this.createGeneralAgent()
    };
  }

  /**
   * Main orchestration method - analyzes intent and routes to appropriate agent
   */
  async processMessage(message, context = {}) {
    console.log('🎯 Orchestrator: Analyzing user message...');
    
    // Step 1: Analyze user intent
    const intent = await this.analyzeIntent(message, context);
    console.log('🎯 Detected intent:', intent.type);
    
    // Step 2: Route to appropriate agent
    const response = await this.routeToAgent(intent, message, context);
    
    return response;
  }

  /**
   * Analyze user intent using LLM
   */
  async analyzeIntent(message, context) {
    if (!this.llm) {
      return this.analyzeIntentFallback(message, context);
    }

    try {
      const prompt = `Analyze this user message and determine their intent. Consider the conversation context.

User Message: "${message}"

Context: ${JSON.stringify(context.businessProfile || {})}

Classify the intent into ONE of these categories:
1. DISCOVERY - User wants to start a business or asking about business types
2. COMPLIANCE - User asking about licenses, registrations, legal requirements
3. TIMELINE - User asking about setup timeline, steps, process
4. PLATFORM - User asking about Swiggy, Zomato, Amazon, online platforms
5. COST - User asking about costs, fees, expenses
6. LOCATION - User specifying or asking about location/state
7. READINESS - User asking about readiness, preparation, how ready they are
8. GENERAL - General questions or greetings

Also extract any key entities:
- Business type (cafe, restaurant, retail, etc.)
- Location (city, state)
- Platform names
- Specific compliance items

Respond in JSON format:
{
  "type": "INTENT_TYPE",
  "confidence": 0.0-1.0,
  "entities": {
    "businessType": "...",
    "location": "...",
    "platform": "..."
  },
  "reasoning": "brief explanation"
}`;

      const completion = await this.llm.chat.completions.create({
        model: process.env.LLM_MODEL || 'grok-2-latest',
        messages: [
          { role: 'system', content: 'You are an intent classification expert. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 300
      });

      const response = completion.choices[0].message.content;
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return this.analyzeIntentFallback(message, context);
      
    } catch (error) {
      console.error('❌ Intent analysis error:', error.message);
      return this.analyzeIntentFallback(message, context);
    }
  }

  /**
   * Fallback intent analysis using pattern matching
   */
  analyzeIntentFallback(message, context) {
    const lowerMsg = message.toLowerCase();
    
    // Discovery patterns
    if (lowerMsg.match(/\b(start|open|launch|begin|want to|planning)\b.*\b(business|cafe|restaurant|store|shop)\b/)) {
      return {
        type: 'DISCOVERY',
        confidence: 0.8,
        entities: this.extractEntities(message),
        reasoning: 'Pattern match: business startup intent'
      };
    }
    
    // Compliance patterns
    if (lowerMsg.match(/\b(license|registration|permit|gst|fssai|compliance|legal|requirement)\b/)) {
      return {
        type: 'COMPLIANCE',
        confidence: 0.8,
        entities: this.extractEntities(message),
        reasoning: 'Pattern match: compliance inquiry'
      };
    }
    
    // Timeline patterns
    if (lowerMsg.match(/\b(timeline|how long|steps|process|when|duration|time)\b/)) {
      return {
        type: 'TIMELINE',
        confidence: 0.7,
        entities: this.extractEntities(message),
        reasoning: 'Pattern match: timeline inquiry'
      };
    }
    
    // Platform patterns
    if (lowerMsg.match(/\b(swiggy|zomato|amazon|platform|online|delivery)\b/)) {
      return {
        type: 'PLATFORM',
        confidence: 0.8,
        entities: this.extractEntities(message),
        reasoning: 'Pattern match: platform inquiry'
      };
    }
    
    // Cost patterns
    if (lowerMsg.match(/\b(cost|price|fee|expense|money|budget|how much)\b/)) {
      return {
        type: 'COST',
        confidence: 0.7,
        entities: this.extractEntities(message),
        reasoning: 'Pattern match: cost inquiry'
      };
    }
    
    // Readiness patterns
    if (lowerMsg.match(/\b(ready|prepared|readiness|score|assessment|how ready|am i ready|preparedness)\b/)) {
      return {
        type: 'READINESS',
        confidence: 0.8,
        entities: this.extractEntities(message),
        reasoning: 'Pattern match: readiness inquiry'
      };
    }
    
    return {
      type: 'GENERAL',
      confidence: 0.5,
      entities: this.extractEntities(message),
      reasoning: 'Default: general inquiry'
    };
  }

  /**
   * Extract entities from message
   */
  extractEntities(message) {
    const entities = {};
    const lowerMsg = message.toLowerCase();
    
    // Business types
    const businessTypes = {
      'cafe': 'cafe',
      'restaurant': 'restaurant',
      'food': 'restaurant',
      'retail': 'retail',
      'store': 'retail',
      'shop': 'retail',
      'manufacturing': 'manufacturing',
      'factory': 'manufacturing',
      'it': 'it_services',
      'software': 'it_services'
    };
    
    for (const [key, value] of Object.entries(businessTypes)) {
      if (lowerMsg.includes(key)) {
        entities.businessType = value;
        break;
      }
    }
    
    // Cities
    const cities = ['bengaluru', 'bangalore', 'mumbai', 'delhi', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'surat'];
    for (const city of cities) {
      if (lowerMsg.includes(city)) {
        entities.city = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }
    
    // Platforms
    if (lowerMsg.includes('swiggy')) entities.platform = 'swiggy';
    if (lowerMsg.includes('zomato')) entities.platform = 'zomato';
    if (lowerMsg.includes('amazon')) entities.platform = 'amazon';
    
    return entities;
  }

  /**
   * Route to appropriate agent based on intent
   */
  async routeToAgent(intent, message, context) {
    const agentMap = {
      'DISCOVERY': 'discoveryAgent',
      'COMPLIANCE': 'complianceAgent',
      'TIMELINE': 'timelineAgent',
      'PLATFORM': 'platformAgent',
      'COST': 'complianceAgent', // Cost info comes from compliance agent
      'READINESS': 'readinessAgent',
      'LOCATION': 'discoveryAgent',
      'GENERAL': 'generalAgent'
    };
    
    const agentName = agentMap[intent.type] || 'generalAgent';
    const agent = this.agents[agentName];
    
    console.log(`🤖 Routing to ${agentName}...`);
    
    return await agent.process(message, intent, context);
  }

  /**
   * Create Intent Analyzer Agent
   */
  createIntentAnalyzer() {
    return {
      name: 'IntentAnalyzer',
      process: async (message, context) => {
        return await this.analyzeIntent(message, context);
      }
    };
  }

  /**
   * Create Discovery Agent - Handles business discovery and initial setup
   */
  createDiscoveryAgent() {
    const self = this;
    return {
      name: 'DiscoveryAgent',
      process: async (message, intent, context) => {
        const entities = intent.entities || {};
        const businessProfile = context.businessProfile || {};
        
        // Update business profile with extracted entities
        if (entities.businessType) businessProfile.businessType = entities.businessType;
        if (entities.city) businessProfile.city = entities.city;
        
        // Generate contextual response using LLM
        if (self.llm) {
          try {
            const prompt = `You are a friendly business advisor helping someone start their business in India.

User said: "${message}"

Detected business type: ${entities.businessType || 'not specified'}
Location: ${entities.city || 'not specified'}

Provide a warm, encouraging response that:
1. Acknowledges their business idea
2. Asks for any missing information (business type, location, team size, revenue estimate)
3. Briefly mentions what comes next (compliance requirements, timeline)
4. Keep it conversational and under 150 words

Be specific to their business type if mentioned.`;

            const completion = await self.llm.chat.completions.create({
              model: self.model,
              messages: [
                { role: 'system', content: 'You are a helpful MSME business advisor in India. Be warm, encouraging, and practical.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.7,
              max_tokens: 300
            });

            return {
              message: completion.choices[0].message.content,
              type: 'discovery',
              data: {
                businessProfile,
                nextStep: 'readiness_check',
                entities
              }
            };
          } catch (error) {
            console.error('❌ Discovery agent LLM error:', error.message);
          }
        }
        
        // Fallback response
        const businessType = entities.businessType || 'business';
        const location = entities.city || 'your city';
        
        return {
          message: `Great! Starting a ${businessType} in ${location} is an exciting journey! 🎉\n\nTo help you navigate the compliance requirements, I need a few more details:\n\n1. **Business Type**: ${entities.businessType ? '✅ ' + businessType : '❓ What type of business?'}\n2. **Location**: ${entities.city ? '✅ ' + location : '❓ Which city/state?'}\n3. **Team Size**: How many employees will you have?\n4. **Revenue Estimate**: Expected monthly earnings?\n\nOnce I have these details, I'll provide you with:\n📋 Mandatory compliance requirements\n📅 Step-by-step timeline\n💰 Cost breakdown\n🛵 Platform onboarding guide (Swiggy, Zomato, etc.)`,
          type: 'discovery',
          data: {
            businessProfile,
            nextStep: 'readiness_check',
            entities
          }
        };
      }
    };
  }

  /**
   * Create Compliance Agent - Handles compliance requirements and regulations
   */
  createComplianceAgent() {
    const self = this;
    return {
      name: 'ComplianceAgent',
      process: async (message, intent, context) => {
        const businessProfile = context.businessProfile || {};
        
        // Get compliance requirements from rule engine
        let complianceData = null;
        if (businessProfile.businessType && businessProfile.state) {
          complianceData = self.ruleEngine.evaluateCompliance(businessProfile);
          console.log('🔍 RuleEngine evaluated compliance:', complianceData.mandatory.length, 'mandatory items');
        }
        
        // Generate contextual response using LLM
        if (self.llm && complianceData) {
          try {
            const prompt = `You are a compliance expert helping with Indian business regulations.

User asked: "${message}"

Business Profile:
- Type: ${businessProfile.businessType || 'not specified'}
- Location: ${businessProfile.city || 'not specified'}, ${businessProfile.state || 'not specified'}

Mandatory Compliances:
${complianceData.mandatory.slice(0, 5).map(c => `- ${c.name}: ${c.description}`).join('\n')}

Provide a clear, helpful response that:
1. Lists the key mandatory requirements
2. Explains WHY each is needed (briefly)
3. Mentions estimated costs and timeline
4. Keeps it under 200 words

Be specific and actionable.`;

            const completion = await self.llm.chat.completions.create({
              model: self.model,
              messages: [
                { role: 'system', content: 'You are an expert in Indian MSME compliance. Explain requirements clearly and simply.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.6,
              max_tokens: 400
            });

            return {
              message: completion.choices[0].message.content,
              type: 'compliance_mapping',
              data: {
                mandatory: complianceData.mandatory,
                recommended: complianceData.recommended,
                businessProfile
              }
            };
          } catch (error) {
            console.error('❌ Compliance agent LLM error:', error.message);
          }
        }
        
        // Fallback response
        return {
          message: `📋 **Compliance Requirements for Your Business**\n\nFor a ${businessProfile.businessType || 'business'} in ${businessProfile.state || 'India'}, here are the key requirements:\n\n**Mandatory:**\n• Business Registration (Proprietorship/LLP/Pvt Ltd)\n• GST Registration (if turnover > ₹40L/year)\n• Professional Tax (for employees)\n• Shop & Establishment Act Registration\n\n**Industry-Specific:**\n• ${businessProfile.businessType === 'cafe' || businessProfile.businessType === 'restaurant' ? 'FSSAI Food License' : 'Industry-specific licenses'}\n• Fire Safety Certificate\n• Municipal Trade License\n\n**Timeline**: 2-4 weeks for basic setup\n**Estimated Cost**: ₹5,000-15,000 for initial setup\n\nWould you like a detailed timeline or cost breakdown?`,
          type: 'compliance_mapping',
          data: {
            mandatory: complianceData?.mandatory || [],
            recommended: complianceData?.recommended || [],
            businessProfile
          }
        };
      }
    };
  }

  /**
   * Create Timeline Agent - Handles timeline and process questions
   */
  createTimelineAgent() {
    const self = this;
    return {
      name: 'TimelineAgent',
      process: async (message, intent, context) => {
        const businessProfile = context.businessProfile || {};
        
        // Generate timeline using rule engine
        let timelineData = null;
        if (businessProfile.businessType && businessProfile.state) {
          const complianceData = self.ruleEngine.evaluateCompliance(businessProfile);
          timelineData = self.ruleEngine.generateTimeline(complianceData.mandatory);
          console.log('📅 RuleEngine generated timeline:', timelineData.totalWeeks, 'weeks');
        }
        
        // Generate contextual response using LLM
        if (self.llm && timelineData) {
          try {
            const prompt = `You are a business setup advisor creating a timeline for an Indian MSME.

User asked: "${message}"

Business: ${businessProfile.businessType || 'business'} in ${businessProfile.city || 'India'}

Timeline Data:
${timelineData.timeline.slice(0, 6).map(t => `Week ${t.week}: ${t.compliance} (₹${t.cost})`).join('\n')}

Total Cost: ₹${timelineData.totalCost}
Total Duration: ${timelineData.totalWeeks} weeks

Create a clear, actionable timeline response that:
1. Shows week-by-week breakdown
2. Highlights key milestones
3. Mentions total time and cost
4. Keeps it under 200 words

Make it encouraging and practical.`;

            const completion = await self.llm.chat.completions.create({
              model: self.model,
              messages: [
                { role: 'system', content: 'You are a business setup expert. Create clear, actionable timelines.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.6,
              max_tokens: 400
            });

            return {
              message: completion.choices[0].message.content,
              type: 'timeline_generation',
              data: {
                timeline: timelineData.timeline,
                totalCost: timelineData.totalCost,
                totalWeeks: timelineData.totalWeeks,
                businessProfile
              }
            };
          } catch (error) {
            console.error('❌ Timeline agent LLM error:', error.message);
          }
        }
        
        // Fallback response
        return {
          message: `📅 **Your Business Launch Timeline**\n\n**Week 1-2: Foundation**\n• Finalize business name and structure\n• Apply for business registration\n• Open current bank account\n\n**Week 3-4: Compliance**\n• Complete GST registration (if applicable)\n• Get FSSAI license (for food businesses)\n• Apply for Shop & Establishment Act\n\n**Week 5-6: Operations**\n• Set up accounting systems\n• Get professional tax registration\n• Apply for fire safety certificate\n\n**Week 7-8: Launch**\n• Complete all inspections\n• Get final approvals\n• Start operations!\n\n**Total Estimated Cost**: ₹8,000-20,000\n**Total Timeline**: 6-8 weeks\n\nReady to start with Week 1?`,
          type: 'timeline_generation',
          data: {
            timeline: timelineData?.timeline || [],
            totalCost: timelineData?.totalCost || 15000,
            totalWeeks: timelineData?.totalWeeks || 8,
            businessProfile
          }
        };
      }
    };
  }

  /**
   * Create Platform Agent - Handles platform onboarding questions
   */
  createPlatformAgent() {
    const self = this;
    return {
      name: 'PlatformAgent',
      process: async (message, intent, context) => {
        const entities = intent.entities || {};
        const platform = entities.platform || 'all platforms';
        
        // Generate contextual response using LLM
        if (self.llm) {
          try {
            const prompt = `You are an expert on food delivery and e-commerce platforms in India.

User asked: "${message}"

Platform mentioned: ${platform}

Provide detailed information about:
1. Requirements for ${platform} (FSSAI, GST, documents)
2. Commission structure
3. Approval timeline
4. Tips for success

Keep it under 200 words and actionable.`;

            const completion = await self.llm.chat.completions.create({
              model: self.model,
              messages: [
                { role: 'system', content: 'You are an expert on Swiggy, Zomato, and Amazon seller onboarding in India.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.7,
              max_tokens: 400
            });

            return {
              message: completion.choices[0].message.content,
              type: 'platform_onboarding',
              data: {
                platform,
                platforms: {
                  swiggy: { commission: '15-25%', timeline: '3-7 days' },
                  zomato: { commission: '18-23%', timeline: '2-5 days' },
                  amazon: { commission: '5-20%', timeline: '7-14 days' }
                }
              }
            };
          } catch (error) {
            console.error('❌ Platform agent LLM error:', error.message);
          }
        }
        
        // Fallback response
        return {
          message: `🛵 **Platform Onboarding Guide**\n\n**Swiggy Requirements:**\n• FSSAI License (mandatory)\n• GST Registration (recommended)\n• Bank Account for payments\n• Menu with pricing\n• Restaurant photos\n\n**Zomato Requirements:**\n• FSSAI License (mandatory)\n• Bank Account for payments\n• Menu and photos\n• Basic business documents\n\n**Commission Structure:**\n• Swiggy: 15-25% of order value\n• Zomato: 18-23% of order value\n\n**Approval Timeline:**\n• Swiggy: 3-7 days\n• Zomato: 2-5 days\n\n**Documents Needed:**\n• Business registration proof\n• FSSAI certificate\n• PAN card\n• Bank account details\n• Menu with photos\n\nI can help you prepare these documents step by step!`,
          type: 'platform_onboarding',
          data: {
            platform,
            platforms: {
              swiggy: { commission: '15-25%', timeline: '3-7 days' },
              zomato: { commission: '18-23%', timeline: '2-5 days' }
            }
          }
        };
      }
    };
  }

  /**
   * Create Readiness Agent - Uses RuleEngine for business readiness scoring
   */
  createReadinessAgent() {
    const self = this;
    return {
      name: 'ReadinessAgent',
      process: async (message, intent, context) => {
        const businessProfile = context.businessProfile || {};
        
        // Use RuleEngine to calculate readiness score
        let readinessScore = null;
        if (businessProfile.businessType && businessProfile.state) {
          const complianceData = self.ruleEngine.evaluateCompliance(businessProfile);
          readinessScore = self.ruleEngine.calculateReadinessScore(businessProfile, complianceData.mandatory);
          console.log('📊 RuleEngine calculated readiness score:', readinessScore.score + '%');
        }
        
        // Generate contextual response using LLM
        if (self.llm && readinessScore) {
          try {
            const prompt = `You are a business readiness advisor analyzing an Indian MSME's preparedness.

User asked: "${message}"

Business Profile:
- Type: ${businessProfile.businessType || 'not specified'}
- Location: ${businessProfile.city || 'not specified'}, ${businessProfile.state || 'not specified'}

Readiness Analysis:
- Score: ${readinessScore.score}%
- Completed: ${readinessScore.completed}/${readinessScore.totalRequired} requirements
- Missing: ${readinessScore.missing.length} items

Provide an encouraging response that:
1. Acknowledges their current readiness level
2. Highlights what they've done well
3. Identifies the most critical missing items
4. Suggests the next 2-3 steps to improve readiness
5. Keeps it under 150 words

Be motivational and actionable.`;

            const completion = await self.llm.chat.completions.create({
              model: self.model,
              messages: [
                { role: 'system', content: 'You are a business readiness coach. Be encouraging and practical.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.7,
              max_tokens: 300
            });

            return {
              message: completion.choices[0].message.content,
              type: 'readiness_report',
              data: {
                readinessScore,
                businessProfile,
                nextStep: 'compliance_mapping'
              }
            };
          } catch (error) {
            console.error('❌ Readiness agent LLM error:', error.message);
          }
        }
        
        // Fallback response
        return {
          message: `📊 **Business Readiness Assessment**

Your current readiness score: ${readinessScore?.score || 70}%

**What You've Done Well:**
✅ ${readinessScore?.completed || 3} requirements completed
✅ Basic business concept established
✅ Location identified

**Critical Missing Items:**
❌ Business registration
❌ GST registration (if applicable)
❌ Industry-specific licenses

**Next Steps to Improve Readiness:**
1. **Week 1**: Complete business registration
2. **Week 2**: Apply for industry-specific licenses
3. **Week 3**: Set up GST registration

**Target**: Reach 90%+ readiness before launching

Would you like me to help you with the specific compliance requirements?`,
          type: 'readiness_report',
          data: {
            readinessScore: readinessScore || { score: 70, completed: 3, totalRequired: 5, missing: [] },
            businessProfile,
            nextStep: 'compliance_mapping'
          }
        };
      }
    };
  }

  /**
   * Create General Agent - Handles general queries and greetings
   */
  createGeneralAgent() {
    const self = this;
    return {
      name: 'GeneralAgent',
      process: async (message, intent, context) => {
        // Generate contextual response using LLM
        if (self.llm) {
          try {
            const prompt = `You are a friendly MSME compliance assistant for Indian businesses.

User said: "${message}"

Provide a helpful, warm response that:
1. Addresses their query or greeting
2. Offers to help with business setup, compliance, or platform onboarding
3. Asks what they'd like to know more about
4. Keeps it under 100 words

Be conversational and encouraging.`;

            const completion = await self.llm.chat.completions.create({
              model: self.model,
              messages: [
                { role: 'system', content: 'You are a helpful MSME compliance assistant. Be warm, friendly, and concise.' },
                { role: 'user', content: prompt }
              ],
              temperature: 0.8,
              max_tokens: 200
            });

            return {
              message: completion.choices[0].message.content,
              type: 'general_response',
              data: null
            };
          } catch (error) {
            console.error('❌ General agent LLM error:', error.message);
          }
        }
        
        // Fallback response
        return {
          message: `👋 Hello! I'm your MSME Compliance Navigator, here to help you start and grow your business in India!\n\nI can assist you with:\n\n📋 **Business Setup**: Registration, licenses, legal structure\n🏢 **Compliance**: GST, FSSAI, state-specific requirements\n📊 **Platform Integration**: Swiggy, Zomato, Amazon onboarding\n💰 **Cost & Timeline**: Setup estimates and planning\n\nWhat would you like to know about? Feel free to ask anything about starting your business!`,
          type: 'general_response',
          data: null
        };
      }
    };
  }
}
