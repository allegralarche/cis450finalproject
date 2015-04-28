import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;


public class Product {
	
	private String name;
	private String category;
	
	public Product(String name, String category) {
		this.name = name;
		this.category = category;
	}
	
	public void print() {
		System.out.println("Name: " + name + ", Category: " + category);
	}
	
	public void writeToDB(Connection conn) {
		try {
			String sql= "INSERT INTO Product VALUES(?,?)";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, name);
			ps.setString(2, category);
			ps.execute();
			ps.close();
    	} catch(SQLException se){
    		se.printStackTrace();
    	} 
	}

}
