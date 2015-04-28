import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Connection;


public class Category {
	
	private String name;
	
	public Category(String name) {
		this.name = name;
	}
	
	public void print() {
		System.out.println(name);
	}
	
	public void writeToDB(Connection conn) {
		try {
			String sql= "INSERT INTO Category VALUES(?)";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, name);
			ps.execute();
			ps.close();
    	} catch(SQLException se){
    		se.printStackTrace();
    	} 
	}

}
