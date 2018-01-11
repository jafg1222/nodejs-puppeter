//////////////////////////
// Use of the puppeter // 
// Autor: jafg1222    //               
////////////////////////
const puppeteer = require('puppeteer');//requiere for puppeter

async function run() {
    const browser = await puppeteer.launch({
        headless: false
      });

      const page = await browser.newPage();
      const listOfUsers = [];//Contains de list of users extract         

      
      
      const userToSearch = 'jhon'; //Params of search 
      const searchUrl = `https://github.com/search?q=${userToSearch}&type=Users&utf8=%E2%9C%93`;//Link will search in github
    
      await page.goto(searchUrl); //redirect to the searchUrl
      await page.waitFor(2 * 1000);
      
      ///////////////////////////////
      // Nodes of the information //
      //////////////////////////////
      const NUMBER_OF_USERS = "user-list-item";
      const USER_NODO = "#user_search_results > div.user-list > div:nth-child($index) > div.d-flex > div > a";  
      const USERNAME_NODO = "#user_search_results > div.user-list > div:nth-child($index) > div.d-flex > div > span";
      

      const numPages = await getNumPages(page);//Call the funcion wich provide de number of pages 
      
      for (let h = 1; h <= numPages; h++) {                
        let pageUrl = searchUrl + '&p=' + h;//rewritte the url with the new page number
        await page.goto(pageUrl); //redirect       

        let listInSearch = await page.evaluate((sel)=>{
            return  document.getElementsByClassName(sel).length; //return the length of the list what contains de users
        },NUMBER_OF_USERS);        
        for(let l = 1; l<listInSearch;l++){
            
            let USER_CHILD = USER_NODO.replace("$index",l);//change the number of the child  
            let USERNAME_CHILD = USERNAME_NODO.replace("$index",l);//change the number of the child  

            let user = await page.evaluate((sel)=>{
                return document.querySelector(sel).innerHTML; //return the github user
            },USER_CHILD);

            let userName = await page.evaluate((sel)=>{
                return document.querySelector(sel).innerHTML; //return the name of the github user
            },USERNAME_CHILD);

            let userExtract = user.replace("<em>",'').replace("</em>",'');//cast of the information
            let userNameExtract = userName.replace("<em>",'').replace("</em>",'');//cast of the information            
            
            let userAdd = {"GithubUser":"https://github.com/"+userExtract,"Name":userNameExtract};//create the field for the list

            listOfUsers.push(userAdd);//add to the list the user data
            
        }
        break;//This breake is because Github detect and block for excess of requests
      }
      console.log(listOfUsers);//print the entery data users
      browser.close();//close the conections
}

////////////////////////////////////////////
// Function calculate the number of pages //
////////////////////////////////////////////
async function getNumPages(page) {
    //var contain the selector of the number of users in the search
    const NUM_USER_SELECTOR = '#js-pjax-container > div > div.columns > div.column.three-fourths.codesearch-results > div > div.d-flex.flex-justify-between.border-bottom.pb-3 > h3';       
  
    let inner = await page.evaluate((sel) => {
      let html = document.querySelector(sel).innerHTML;        
      // format is: "69,803 users"
      return html.replace(',', '').replace('users', '').trim();
    }, NUM_USER_SELECTOR);
  
    const numUsers = parseInt(inner);
  
    console.log('numUsers: ', numUsers);
  
    /**
     * GitHub shows 10 resuls per page, so
     */
    return Math.ceil(numUsers / 10);
  }
  
  run(); //run the app