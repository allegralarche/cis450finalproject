import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Connection;

public class Offering {
	
	private String category;
	private String businessid;
	
	public Offering (String businessid, String category) {
		this.businessid = businessid;
		this.category = category;
	}
	
	public void print() {
		System.out.println("Business: " + businessid + ", Category: " + category);
	}
	
	public void writeToDB(Connection conn) {
		try {
			String sql= "INSERT INTO Offers VALUES(?,?)";
			PreparedStatement ps = conn.prepareStatement(sql);
			ps.setString(1, businessid);
			ps.setString(2, category);
			ps.execute();
			ps.close();
    	} catch(SQLException se){
    		se.printStackTrace();
    	} 
	}

}
