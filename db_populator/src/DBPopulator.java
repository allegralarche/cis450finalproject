import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.ParseException;
import org.json.simple.parser.JSONParser;

public class DBPopulator {
	// JDBC driver name and database URL
    static final String DB_URL = "jdbc:oracle:thin:@//cis450projectdb.cc2zrrk5p1po.us-east-1.rds.amazonaws.com:1521/CIS450DB";

    //  Database credentials
    static final String username = "admin";
    static final String password = "cis450project";
	static Connection conn;
       
    public static void main(String[] args) {
    	establishConnection();
    	insertBusinesses(); 
    	insertCategories();
    	insertOffers();
    	insertProducts();
    	endConnection(); 
    }
    
    private static void establishConnection() {
	    try {
	    	Class.forName("oracle.jdbc.driver.OracleDriver");
	        conn = DriverManager.getConnection(DB_URL, username, password);
	    } catch(Exception e){
	        e.printStackTrace();
	    } 
    }
    
    private static void endConnection() {
        try {
        	if(conn != null) {
              conn.close();
            }
        } catch(SQLException se){
        	se.printStackTrace();
        }
    }
    
    //Business attributes: businessid, name, latitude, longitude, address, rating
    private static void insertBusinesses() {
    	JSONParser parser = new JSONParser();
        try {     
            JSONArray arr = (JSONArray) parser.parse(new FileReader("data/businesses.json"));
            for (Object o : arr) {
            	JSONObject business = (JSONObject) o;
            	String businessid = (String) business.get("business_id");
            	String name = (String) business.get("name");
            	double latitude = (Double) business.get("latitude");
            	double longitude = (Double) business.get("longitude");
            	String address = (String) business.get("address");
            	double rating = (Double) business.get("rating");
            	Business b = new Business(businessid, name, latitude, longitude, address, rating);
            	//b.print();
            	b.writeToDB(conn);
            }
        } catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}  
    }
    
    private static void insertCategories() {
    	JSONParser parser = new JSONParser();        	
        try {     
            JSONArray arr = (JSONArray) parser.parse(new FileReader("data/categories.json"));
            for (Object o : arr) {
            	JSONObject category = (JSONObject) o;
            	String name = (String) category.get("name");
            	Category c = new Category(name);
            	//c.print();
            	c.writeToDB(conn);
            }
        } catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }
    
    private static void insertOffers() {
    	JSONParser parser = new JSONParser();        	
        try {     
            JSONArray arr = (JSONArray) parser.parse(new FileReader("data/offers.json"));
            for (Object o : arr) {
            	JSONObject offering = (JSONObject) o;
            	String businessid = (String) offering.get("business_id");
            	String category = (String) offering.get("category_name");
            	Offering off = new Offering(businessid, category);
            	//off.print();
            	off.writeToDB(conn);
            }
        } catch (FileNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
    }
    
    private static void insertProducts() {
    	//Read grocery products
    	BufferedReader br = null;
    	try {
			br = new BufferedReader(new FileReader("data/grocery_products.txt"));
			String product = br.readLine();
			while (product != null) {
				product = product.trim();
				Product p = new Product(product, "Grocery");
				p.writeToDB(conn);
				//p.print();
				product = br.readLine();
			}
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (br != null) {
				try {
					br.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
    	
    	//Read health products
    	try {
			br = new BufferedReader(new FileReader("data/health_products.txt"));
			String product = br.readLine();
			while (product != null) {
				product = product.trim();
				Product p = new Product(product, "Health & Medical");
				p.writeToDB(conn);
				//p.print();
				product = br.readLine();
			}
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (br != null) {
				try {
					br.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
    	
    	//Read pet products
    	try {
			br = new BufferedReader(new FileReader("data/pet_products.txt"));
			String product = br.readLine();
			while (product != null) {
				product = product.trim();
				Product p1 = new Product(product, "Pets");
				Product p2 = new Product(product, "Pet Stores");
				p1.writeToDB(conn);
				p2.writeToDB(conn);
				product = br.readLine();
			}
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (br != null) {
				try {
					br.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
    	
    	//Read office products
    	try {
			br = new BufferedReader(new FileReader("data/office_equipment_products.txt"));
			String product = br.readLine();
			while (product != null) {
				product = product.trim();
				Product p = new Product(product, "Office Equipment");
				p.writeToDB(conn);
				product = br.readLine();
			}
		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (br != null) {
				try {
					br.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
    	
    }

}
