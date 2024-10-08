export async function POST(request) {
  const { firstname, lastname, address, disease, selectedAppointment, postSelector } = await request.json();
  let tokenData = null;

  // First API call: Generate the token
  const getToken = async () => {
    try {
      const response = await fetch(
        'https://guardiant--willg.sandbox.my.salesforce.com/services/oauth2/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'password',
            client_id: '3MVG9o0Rj_GRmEuhgJGdYiecC4nWCNc_UD._J25IceU_2FbirBJKBrL.FpKCBiWFUQOrSPnurqc7ZUfx9W29n',
            client_secret: '1B0E6BBF115C6813EF945C2E45F4E2393CB714E60D42EB5797EA3D78BB06BD6F',
            username: 'saiful.lightcode@gradiant.com',
            password: 'Salesforce2024@',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Failed to fetch token');
      }

      tokenData = await response.json();
      return tokenData.access_token; // Return the access token
    } catch (error) {
      console.error('Error fetching token:', error.message);
      throw new Error('Failed to generate token');
    }
  };

  // Second API call: Submit form data
  const submitFormData = async (token) => {
    try {
      const apiResponse = await fetch(
        'https://guardiant--willg.sandbox.my.salesforce.com/services/apexrest/guardiantAPI',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            postSelector === 1 
              ? { postSelector, address, disease } // If postSelector is 1, send only address and disease
              : { postSelector, address, disease, firstname, lastname, selectedAppointment } // If postSelector is 2, send all data
          ),
        }
      );

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.message || 'Failed to submit form data');
      }

      // Parse the JSON response
      const responseData = await apiResponse.json();
      console.log('Raw API Response Data:', responseData); // Log for debugging

      // Ensure responseData is an array and create newFields
      const newFields = responseData;

      return { newFields };
    } catch (error) {
      console.error('Error submitting form:', error.message);
      throw new Error('Failed to submit form');
    }
  };

  try {
    const token = await getToken(); // Get token before submitting form data
    const formDataResponse = await submitFormData(token);

    // Add a success message to the response
    return new Response(JSON.stringify({
      data: formDataResponse, // Include the original response data
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('API error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
